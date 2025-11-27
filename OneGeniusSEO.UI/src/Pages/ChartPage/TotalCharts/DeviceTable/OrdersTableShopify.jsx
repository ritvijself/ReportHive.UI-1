import React from "react";
import style from "./DeviceTable.module.css"; // keep your styling

const OrdersTableShopify = ({ title }) => {
  const products = [
    {
      productImage: "https://via.placeholder.com/60x40", // replace with actual
      productName: "Chrysler Sunbeam",
      productVendor: "FAW",
      productType: "Mirror",
      productsSold: 25,
      grossSales: "$5,704.76",
      discounts: "$63.12",
      netSales: "$43.76",
    },
    {
      productImage: "https://via.placeholder.com/60x40", // replace with actual
      productName: "Tofas Dogan",
      productVendor: "Beijing",
      productType: "Wheels",
      productsSold: 25,
      grossSales: "$6,523.77",
      discounts: "$75.04",
      netSales: "$33.64",
    },
  ];

  const columns = [
    { key: "product", label: "PRODUCT" },
    { key: "productVendor", label: "PRODUCT VENDOR" },
    { key: "productType", label: "PRODUCT TYPE" },
    { key: "productsSold", label: "PRODUCTS SOLD" },
    { key: "grossSales", label: "GROSS SALES" },
    { key: "discounts", label: "DISCOUNTS" },
    { key: "netSales", label: "NET SALES" },
  ];

  const renderCell = (item, column) => {
    switch (column.key) {
      case "product":
        return (
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <img
              src={item.productImage}
              alt={item.productName}
              style={{ width: "60px", height: "40px", objectFit: "cover" }}
            />
            <span>{item.productName}</span>
          </div>
        );
      default:
        return item[column.key] || "-";
    }
  };

  return (
    <div className={style.orders_content_box}>
      <div className="d-flex align-items-center">
        <h5 className={`text-muted pt-3 m-0 ${style.page_heading}`}>
          {title || "Products"}
        </h5>
      </div>

      <div className={style.table_container}>
        <table className={style.metrics_table}>
          <thead>
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} style={{ color: "red" }}>
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {products.length > 0 ? (
              products.map((item, i) => (
                <tr key={i}>
                  {columns.map((col, index) => (
                    <td key={index}>{renderCell(item, col)}</td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="text-center py-3">
                  No data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrdersTableShopify;
