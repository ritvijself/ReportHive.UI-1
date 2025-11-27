

// Aapke ChartGA4.jsx se saare chart imports yahan move kar dein
import ProgressBar from "../../TotalCharts/ProgressBar/ProgressBar";
import DeviceTable from "../../TotalCharts/DeviceTable/DeviceTable";
import LineChartGA4 from "../../TotalCharts/GA4Charts/LineChartGA4";
import LineCharfilledGA4 from "../../TotalCharts/GA4Charts/LineChartfilledGA4";
import ConversionData from "../../TotalCharts/GA4Charts/ConversionData";
import DeviceBrowserChart from "../../TotalCharts/GA4Charts/DeviceBrowserChart";
import WorldMapChart from "../../TotalCharts/GA4Charts/WorldMapChart";
import DeviceSessionsChart from "../../TotalCharts/GA4Charts/DevicesSessionsChart";
import DeviceBounceBarChart from "../../TotalCharts/GA4Charts/DeviceBounceBarChart";
import MultiLineChartGA4 from "../../TotalCharts/GA4Charts/MultiLineChartGA4";
import ChannelTable from "../../TotalCharts/DeviceTable/ChannelTable";
import AvgEngagementBarChart from "../../TotalCharts/GA4Charts/AverageEngagementBarChart";
import BarChartActiveUser from "../../TotalCharts/GA4Charts/BarChartActiveUser/BarChartActiveUser";
import LineChartGA4ThreeMonth from "../../TotalCharts/GA4Charts/LineChartGA4ThreeMonth";
import BounceEngagementMetricBox from "../../TotalCharts/GA4Charts/BounceEngagementMetricBox";
import ContactFormChart from "../../TotalCharts/GA4Charts/ContactFormChart";
import ChannelSessionTable from "../../TotalCharts/DeviceTable/ChannelSessionTable";
import MetricDisplayGA4 from "../../TotalCharts/GA4Charts/MetricDisplayGA4/MetricDisplayGA4";

// Ek object banayein jo string key ko component se map kare
export const chartComponents = {
  
  'progressBar': ProgressBar,
  'deviceTable': DeviceTable,
  'lineChartGA4': LineChartGA4,
  'lineChartFilledGA4': LineCharfilledGA4,
  'conversionData': ConversionData,
  'deviceBrowserChart': DeviceBrowserChart,
  'worldMapChart': WorldMapChart,
  'deviceSessionsChart': DeviceSessionsChart,
  'deviceBounceBarChart': DeviceBounceBarChart,
  'multiLineChartGA4': MultiLineChartGA4,
  'channelTable': ChannelTable,
  'avgEngagementBarChart': AvgEngagementBarChart,
  'barChartActiveUser': BarChartActiveUser,
  'lineChartGA4ThreeMonth': LineChartGA4ThreeMonth,
  'bounceEngagementMetricBox': BounceEngagementMetricBox,
  'contactFormChart': ContactFormChart,
  'channelSessionTable': ChannelSessionTable,
  'metricDisplayGA4': MetricDisplayGA4,
};