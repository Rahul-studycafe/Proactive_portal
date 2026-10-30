import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import { Mutex } from "async-mutex";

const mutex = new Mutex();

const baseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1",
  credentials: "include",
  prepareHeaders: (headers) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("portalAccessToken");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
    }
    return headers;
  },
});

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  await mutex.waitForUnlock();
  let result = await baseQuery(args, api, extraOptions);

  const url = typeof args === "string" ? args : args.url;
  const isPublicEndpoint =
    url?.includes("/portal/auth/") ||
    url?.includes("/portal/website-config") ||
    url?.includes("/portal/branding");

  if (result.error && result.error.status === 401 && !isPublicEndpoint) {
    if (!mutex.isLocked()) {
      const release = await mutex.acquire();
      try {
        if (typeof window !== "undefined") {
          localStorage.removeItem("portalAccessToken");
          localStorage.removeItem("portalUser");
          const path = window.location.pathname;
          if (!path.startsWith("/login") && !path.startsWith("/magic-login")) {
            window.location.href = "/login";
          }
        }
        return result;
      } finally {
        release();
      }
    } else {
      await mutex.waitForUnlock();
      result = await baseQuery(args, api, extraOptions);
    }
  }

  return result;
};

export const portalApi = createApi({
  reducerPath: "portalApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    "PortalProfile",
    "WebsiteSettings",
    "PortalCompliance",
    "PortalDocuments",
    "PortalInvoices",
    "PortalReceipts",
    "PortalLedger",
    "PortalDocRequests",
    "PortalQueries",
  ],
  endpoints: (builder) => ({
    // ─── Client Portal Authentication Endpoints ───
    portalLogin: builder.mutation<any, { emailOrPhone: string; password?: string }>({
      query: (credentials) => ({
        url: "/portal/auth/login",
        method: "POST",
        body: credentials,
      }),
      transformResponse: (response: { data: any }) => response.data,
    }),
    portalRequestOtp: builder.mutation<any, { identifier: string }>({
      query: (payload) => ({
        url: "/portal/auth/request-otp",
        method: "POST",
        body: payload,
      }),
      transformResponse: (response: { data: any }) => response.data,
    }),
    portalVerifyOtp: builder.mutation<any, { identifier: string; code: string }>({
      query: (payload) => ({
        url: "/portal/auth/verify-otp",
        method: "POST",
        body: payload,
      }),
      transformResponse: (response: { data: any }) => response.data,
    }),
    portalSendMagicLink: builder.mutation<any, { email: string }>({
      query: (payload) => ({
        url: "/portal/auth/send-magic-link",
        method: "POST",
        body: payload,
      }),
      transformResponse: (response: { data: any }) => response.data,
    }),
    portalVerifyMagicLink: builder.mutation<any, { token: string }>({
      query: (payload) => ({
        url: "/portal/auth/verify-magic-link",
        method: "POST",
        body: payload,
      }),
      transformResponse: (response: { data: any }) => response.data,
    }),
    portalLogout: builder.mutation<any, void>({
      query: () => ({
        url: "/portal/auth/logout",
        method: "POST",
      }),
    }),

    // ─── Profile & Firm Branding ───
    getPortalProfile: builder.query<any, void>({
      query: () => "/portal/profile",
      providesTags: ["PortalProfile"],
      transformResponse: (response: { data: any }) => response.data,
    }),
    updatePortalProfile: builder.mutation<any, any>({
      query: (body) => ({
        url: "/portal/profile",
        method: "PUT",
        body,
      }),
      invalidatesTags: ["PortalProfile"],
      transformResponse: (response: { data: any }) => response.data,
    }),
    changePortalPassword: builder.mutation<any, any>({
      query: (body) => ({
        url: "/portal/profile/password",
        method: "PUT",
        body,
      }),
      transformResponse: (response: { data: any }) => response.data,
    }),
    getPortalWebsiteConfig: builder.query<any, void>({
      query: () => "/portal/website-config",
      providesTags: ["WebsiteSettings"],
      transformResponse: (response: { data: any }) => response.data,
    }),

    // ─── Compliance Calendar ───
    getComplianceCalendar: builder.query<any[], { year?: number; month?: number; status?: string } | void>({
      query: (params) => ({
        url: "/portal/compliance",
        params: params || undefined,
      }),
      providesTags: ["PortalCompliance"],
      transformResponse: (response: { data: any[] }) => response.data,
    }),

    // ─── Filed Documents Vault ───
    getPortalDocuments: builder.query<any[], { folder?: string; search?: string } | void>({
      query: (params) => ({
        url: "/portal/documents",
        params: params || undefined,
      }),
      providesTags: ["PortalDocuments"],
      transformResponse: (response: { data: any[] }) => response.data,
    }),

    // ─── Billing, Invoices & Receipts ───
    getPortalInvoices: builder.query<any[], void>({
      query: () => "/portal/invoices",
      providesTags: ["PortalInvoices"],
      transformResponse: (response: { data: any[] }) => response.data,
    }),
    getPortalReceipts: builder.query<any[], void>({
      query: () => "/portal/receipts",
      providesTags: ["PortalReceipts"],
      transformResponse: (response: { data: any[] }) => response.data,
    }),
    getPortalLedger: builder.query<any, { fromDate?: string; toDate?: string } | void>({
      query: (params) => ({
        url: "/portal/ledger",
        params: params || undefined,
      }),
      providesTags: ["PortalLedger"],
      transformResponse: (response: { data: any }) => response.data,
    }),

    // ─── Document Requests & Collaboration ───
    getPortalDocumentRequests: builder.query<any[], void>({
      query: () => "/portal/document-requests",
      providesTags: ["PortalDocRequests"],
      transformResponse: (response: { data: any[] }) => response.data,
    }),
    fulfillPortalDocumentRequest: builder.mutation<any, { requestId: string; formData: FormData }>({
      query: ({ requestId, formData }) => ({
        url: `/portal/requests/${requestId}/fulfill`,
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["PortalDocRequests", "PortalDocuments"],
      transformResponse: (response: { data: any }) => response.data,
    }),

    // ─── Client Helpdesk & Queries ───
    getPortalQueryTickets: builder.query<any[], void>({
      query: () => "/portal/queries",
      providesTags: ["PortalQueries"],
      transformResponse: (response: { data: any[] }) => response.data,
    }),
    createPortalQueryTicket: builder.mutation<any, { type: string; subject: string; message: string; attachments?: string[] }>({
      query: (body) => ({
        url: "/portal/queries",
        method: "POST",
        body,
      }),
      invalidatesTags: ["PortalQueries"],
      transformResponse: (response: { data: any }) => response.data,
    }),

    // ─── Payment Gateway & UPI ───
    getInvoiceUpiQr: builder.query<any, string>({
      query: (invoiceId) => `/invoices/${invoiceId}/upi-qr`,
      transformResponse: (response: { data: any }) => response.data,
    }),
    createInvoicePaymentLink: builder.mutation<any, string>({
      query: (invoiceId) => ({
        url: `/invoices/${invoiceId}/payment-link`,
        method: "POST",
      }),
      transformResponse: (response: { data: any }) => response.data,
    }),
  }),
});

export const {
  usePortalLoginMutation,
  usePortalRequestOtpMutation,
  usePortalVerifyOtpMutation,
  usePortalSendMagicLinkMutation,
  usePortalVerifyMagicLinkMutation,
  usePortalLogoutMutation,
  useGetPortalProfileQuery,
  useUpdatePortalProfileMutation,
  useChangePortalPasswordMutation,
  useGetPortalWebsiteConfigQuery,
  useGetComplianceCalendarQuery,
  useGetPortalDocumentsQuery,
  useGetPortalInvoicesQuery,
  useGetPortalReceiptsQuery,
  useGetPortalLedgerQuery,
  useGetPortalDocumentRequestsQuery,
  useFulfillPortalDocumentRequestMutation,
  useGetPortalQueryTicketsQuery,
  useCreatePortalQueryTicketMutation,
  useGetInvoiceUpiQrQuery,
  useCreateInvoicePaymentLinkMutation,
} = portalApi;

