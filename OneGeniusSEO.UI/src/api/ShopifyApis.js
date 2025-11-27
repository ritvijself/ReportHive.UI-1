export const ShopifyReports = [
    {
      id: 1,
      apiurl: "ShopifyReportApi",
      url: "orders/total",
      title: "Lifetime Orders",
      code: "ShopifyApi001", // matches GetLifetimeOrdersAsync
    },
    {
      id: 2,
      apiurl: "ShopifyReportApi",
      url: "orders/interval",
      title: "Orders by Interval",
      code: "ShopifyApi002", // matches GetOrdersByIntervalAsync
    },
    {
      id: 3,
      apiurl: "ShopifyReportApi",
      url: "checkouts/interval",
      title: "Checkouts by Interval",
      code: "ShopifyApiCheckouts", // matches GetCheckoutsByIntervalAsync
    },
    {
      id: 4,
      apiurl: "ShopifyReportApi",
      url: "customers/total",
      title: "Lifetime Customers",
      code: "ShopifyApiCustomersLifetime", // matches GetLifetimeCustomersAsync
    },
    {
      id: 5,
      apiurl: "ShopifyReportApi",
      url: "customers/interval",
      title: "Customers by Interval",
      code: "ShopifyApiCustomersInterval", // matches GetCustomersByIntervalAsync
    }
  ];
  