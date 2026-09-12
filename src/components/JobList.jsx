import React, { useState } from "react";
import PropTypes from "prop-types";
import { Tabs, Tab, Typography, Box, useTheme, useMediaQuery } from "@mui/material";
import FadeInSection from "./FadeInSection";
import PdfViewerModal from "./PdfViewerModal";
import { getCertificateBySlug } from "../data/certificates";
import { portfolio } from "../data/portfolio";

// View model derived from the single source of truth, keyed by company the
// way the tabs were originally built.
const experienceItems = Object.fromEntries(
  portfolio.experience.map((job) => [
    job.company,
    {
      jobTitle: `${job.role} @`,
      duration: `${job.start} - ${job.end}`,
      desc: job.bullets,
      certificateSlug: job.certificateSlug,
    },
  ])
);

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
            {experienceItems[key].certificateSlug &&
              getCertificateBySlug(experienceItems[key].certificateSlug) && (
                <button
                  type="button"
                  className="joblist-cert-button"
                  onClick={() =>
                    setActiveCertificate(getCertificateBySlug(experienceItems[key].certificateSlug))
                  }
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
