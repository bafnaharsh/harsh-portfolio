import React, { useState } from "react";
import PropTypes from "prop-types";
import { Tabs, Tab, Typography, Box, useTheme, useMediaQuery } from "@mui/material";
import FadeInSection from "./FadeInSection";
import PdfViewerModal from "./PdfViewerModal";
import { getCertificateBySlug } from "../data/certificates";

function TabPanel(props) {
  const { children, value, index, isMobile, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={isMobile ? `full-width-tabpanel-${index}` : `vertical-tabpanel-${index}`}
      aria-labelledby={isMobile ? `full-width-tab-${index}` : `vertical-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: { xs: 2, sm: 3 } }}>
          <Typography component="div">{children}</Typography>
        </Box>
      )}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired,
  isMobile: PropTypes.bool,
};

function a11yProps(index, isMobile) {
  if (isMobile) {
    return {
      id: "full-width-tab-" + index,
      "aria-controls": "full-width-tabpanel-" + index,
    };
  }
  return {
    id: "vertical-tab-" + index,
    "aria-controls": "vertical-tabpanel-" + index,
  };
}

const JobList = () => {
  const [value, setValue] = useState(0);
  const [activeCertificate, setActiveCertificate] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const internshipCertificate = getCertificateBySlug("jp-morgan-forage-internship");

  const experienceItems = {
    Quantiphi: {
      jobTitle: "Machine Learning Engineer @",
      duration: "FEB 2024 - PRESENT",
      desc: [
        "Led 5+ ML engineers in a 24+ member team to ship production multi-agent systems for natural-language enterprise analytics.",
        "Architected ADK-based agents with RAG over 14+ structured data sources, including Kafka topics, Google Ads, and Google Analytics schemas.",
        "Built AI search, recommendation, campaign-generation, and lead-hotspot workflows that reduced analysis and drafting cycles from days to minutes.",
      ],
    },
    "JP Morgan Chase & Co.": {
      jobTitle: "Software Engineer Intern @",
      duration: "NOV 2022 - SEP 2023",
      desc: [
        "Designed a real-time data streaming interface capable of processing 100,000+ data points per second.",
        "Used JP Morgan Chase's Perspective visualization tool to build live financial correlation graphs.",
        "Implemented upper and lower-bound indicators for real-time monitoring of stock-correlation metrics.",
      ],
    },
  };

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Box
      sx={{
        flexGrow: 1,
        bgcolor: "transparent",
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
        height: "auto",
        minHeight: 300,
      }}
    >
      <Tabs
        orientation={!isMobile ? "vertical" : "horizontal"}
        variant="scrollable"
        scrollButtons="auto"
        value={value}
        onChange={handleChange}
        sx={{
          borderRight: isMobile ? 0 : 1,
          borderBottom: isMobile ? 1 : 0,
          borderColor: "var(--lightest-navy)",
          "& .MuiTabs-indicator": {
            backgroundColor: "var(--green-bright)",
          },
          "& .MuiTabs-flexContainer": {
            borderBottom: isMobile ? "1px solid var(--lightest-navy)" : "none",
          },
        }}
      >
        {Object.keys(experienceItems).map((key, i) => (
          <Tab
            key={i}
            label={key}
            {...a11yProps(i, isMobile)}
            sx={{
              color: "var(--slate)",
              fontFamily: "NTR",
              fontSize: "14px",
              textAlign: isMobile ? "center" : "left",
              alignItems: isMobile ? "center" : "flex-start",
              textTransform: "none",
              padding: "10px 20px",
              minHeight: "48px",
              minWidth: isMobile ? "120px" : "auto",
              "&.Mui-selected": {
                color: "var(--green-bright)",
              },
              "&:hover": {
                color: "var(--green-bright)",
                backgroundColor: "var(--green-tint)",
              },
            }}
          />
        ))}
      </Tabs>
      <Box sx={{ flexGrow: 1 }}>
        {Object.keys(experienceItems).map((key, i) => (
          <TabPanel key={i} value={value} index={i} isMobile={isMobile}>
            <span className="joblist-job-title">
              {experienceItems[key]["jobTitle"] + " "}
            </span>
            <span className="joblist-job-company">{key}</span>
            <div className="joblist-duration-row">
              <div className="joblist-duration">{experienceItems[key]["duration"]}</div>
            </div>
            <ul className="job-description">
              {experienceItems[key]["desc"].map((descItem, descIndex) => (
                <FadeInSection key={descIndex} delay={(descIndex + 1) * 100 + "ms"}>
                  <li>{descItem}</li>
                </FadeInSection>
              ))}
            </ul>
            {key === "JP Morgan Chase & Co." && internshipCertificate && (
              <button
                type="button"
                className="joblist-cert-button"
                onClick={() => setActiveCertificate(internshipCertificate)}
              >
                View internship certificate
              </button>
            )}
          </TabPanel>
        ))}
      </Box>
      {activeCertificate && (
        <PdfViewerModal
          title={`${activeCertificate.title} — ${activeCertificate.issuer}`}
          src={`${activeCertificate.file}#view=FitH`}
          shareUrl={`${window.location.origin}/certificate/${activeCertificate.slug}`}
          onClose={() => setActiveCertificate(null)}
        />
      )}
    </Box>
  );
};

export default JobList;
