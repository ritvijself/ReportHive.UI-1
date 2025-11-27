import React from "react";
import { Table, Form } from "react-bootstrap";

const ChartConfigurationTable = ({
  integration,
  charts,
  chartConfigurations,
  onChartToggle,
  onShowComparisonToggle,
  onSelectAllCharts,
  onSelectAllShowComparison,
  onTableTypeToggle,
  onChartTypeToggle,
}) => {
  const config = chartConfigurations[integration.value] || {};
  const TABLE_ONLY_CODES = [
    "GA4Api020",
    "GA4Api052",
    "GMBApi011",
    "GAdsApi002",
    "GAdsApi004",
    "GAdsApi005",
    "GAdsApi006",
    "GAdsApi007",
    "GAdsApi010",
    "GAdsApi011",
  ];

  const allSelected = charts.every((chart) => config[chart.code]?.selected);
  const allComparisonSelected = charts.every(
    (chart) =>
      !config[chart.code]?.selected || !config[chart.code]?.showComparison
  );
  const allTableSelected = charts
    .filter(
      (chart) =>
        TABLE_ONLY_CODES.includes(chart.code) && config[chart.code]?.selected
    )
    .every((chart) => config[chart.code]?.dataShowType === "table");

  const anySelected = charts.some((chart) => config[chart.code]?.selected);
  const anyTableChartSelected = charts.some(
    (chart) =>
      TABLE_ONLY_CODES.includes(chart.code) && config[chart.code]?.selected
  );

  return (
    <Table striped bordered hover>
      <thead>
        <tr>
          <th>
            Monthly Data
            <Form.Check
              type="checkbox"
              label="Select All"
              checked={allSelected}
              onChange={(e) =>
                onSelectAllCharts(integration.value, e.target.checked)
              }
            />
          </th>
          <th>
            Show Comparison in charts (Last 3 Months)
            <Form.Check
              type="checkbox"
              label="Select All"
              checked={allComparisonSelected}
              onChange={(e) =>
                onSelectAllShowComparison(integration.value, !e.target.checked)
              }
              disabled={!anySelected}
            />
          </th>
          <th>
            Show Comparison in tables (Last 3 Months)
            <Form.Check
              type="checkbox"
              label="Select All"
              checked={allTableSelected}
              onChange={(e) => {
                // Only apply to TABLE_ONLY_CODES charts that are selected
                charts.forEach((chart) => {
                  if (
                    TABLE_ONLY_CODES.includes(chart.code) &&
                    config[chart.code]?.selected
                  ) {
                    onTableTypeToggle(integration.value, chart.code);
                  }
                });
              }}
              disabled={!anyTableChartSelected}
            />
          </th>
        </tr>
      </thead>
      <tbody>
        {charts.map((chart) => {
          const chartConfig = config[chart.code] || {};

          return (
            <tr key={chart.code}>
              <td>
                <Form.Check
                  type="checkbox"
                  label={chart.title}
                  checked={chartConfig.selected || false}
                  onChange={() => onChartToggle(integration.value, chart.code)}
                />
              </td>
              <td>
                {TABLE_ONLY_CODES.includes(chart.code) ? null : (
                  <Form.Check
                    type="checkbox"
                    checked={!chartConfig.showComparison}
                    onChange={() =>
                      onShowComparisonToggle(integration.value, chart.code)
                    }
                    disabled={!chartConfig.selected}
                  />
                )}
              </td>
              <td>
                {TABLE_ONLY_CODES.includes(chart.code) && (
                  <Form.Check
                    type="checkbox"
                    checked={chartConfig.dataShowType === "table"}
                    onChange={() =>
                      onTableTypeToggle(integration.value, chart.code)
                    }
                    disabled={!chartConfig.selected}
                  />
                )}
              </td>
            </tr>
          );
        })}
      </tbody>
    </Table>
  );
};

export default ChartConfigurationTable;
