import { useCallback, useEffect, useState } from "react";

import { formatDateLocal } from "../../../utils/FormatDate";

// Fetches label summary links and exposes data + a refetch method for reuse across components

export default function useLabelSummaryLinks({ startDate, apibaseurl, token }) {
  const [labelSummaryLinks, setLabelSummaryLinks] = useState([]);

  const fetchLabelSummaryLinks = useCallback(async () => {
    if (!startDate) {
      setLabelSummaryLinks([]);

      return;
    }

    const formattedStart = formatDateLocal(startDate);

    try {
      const url = `${apibaseurl}/api/ExecutiveSummary/label-SummaryLinkOnly?_startDate=${formattedStart}&_cacheBuster=${new Date().getTime()}`;

      const resp = await fetch(url, {
        method: "GET",

        headers: {
          "Content-Type": "application/json",

          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      if (resp.ok) {
        const apiData = await resp.json();

        const linkRegex = /\[(.*?)\]\((.*?)\)/g;

        const formattedLinks = [];

        apiData.forEach((item) => {
          const s = item.summary || "";

          let match;

          while ((match = linkRegex.exec(s)) !== null) {
            if (match[1] && match[2]) {
              const titleParts = match[1].split("|");

              const finalTitle = titleParts[titleParts.length - 1];

              formattedLinks.push({
                title: finalTitle.trim(),

                url: match[2],
              });
            }
          }
        });

        setLabelSummaryLinks(formattedLinks);
      } else {
        setLabelSummaryLinks([]);
      }
    } catch (e) {
      console.warn("Failed to fetch label summary links for UI", e);

      setLabelSummaryLinks([]);
    }
  }, [startDate, apibaseurl, token]);

  useEffect(() => {
    fetchLabelSummaryLinks().catch(console.error);
  }, [fetchLabelSummaryLinks]);

  return {
    labelSummaryLinks,
    refetchLabelSummaryLinks: fetchLabelSummaryLinks,
  };
}
