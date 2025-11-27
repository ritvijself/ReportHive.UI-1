// src/components/CampaignTable.jsx
import React from "react";
import Table from "react-bootstrap/Table";

const CampaignTable = () => {
  const campaigns = [
    {
      name: "Campaign A",
      impressions: 12000,
      clicks: 300,
      cost: "$450",
      ctr: "2.5%",
    },
    {
      name: "Campaign B",
      impressions: 9500,
      clicks: 210,
      cost: "$320",
      ctr: "2.2%",
    },
    {
      name: "Campaign C",
      impressions: 14000,
      clicks: 420,
      cost: "$600",
      ctr: "3.0%",
    },
  ];

  return (
    <Table striped bordered hover responsive>
      <thead>
        <tr>
          <th>Campaign</th>
          <th>Impressions</th>
          <th>Clicks</th>
          <th>Cost</th>
          <th>CTR</th>
        </tr>
      </thead>
      <tbody>
        {campaigns.map((camp, idx) => (
          <tr key={idx}>
            <td>{camp.name}</td>
            <td>{camp.impressions}</td>
            <td>{camp.clicks}</td>
            <td>{camp.cost}</td>
            <td>{camp.ctr}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export default CampaignTable;
