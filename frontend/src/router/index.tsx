import React from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { RootLayout } from "../layouts/RootLayout";
import { LandingPage } from "../pages/LandingPage";
import { DashboardPage } from "../pages/DashboardPage";
import { DemoModePage } from "../pages/DemoModePage";
import { PublicVerificationPage } from "../pages/PublicVerificationPage";
import { ElectionsPage } from "../pages/ElectionsPage";
import { CreateElectionPage } from "../pages/CreateElectionPage";
import { EvidenceExplorerPage } from "../pages/EvidenceExplorerPage";
import { MerkleExplorerPage } from "../pages/MerkleExplorerPage";
import { AuditPage } from "../pages/AuditPage";
import { ValidatorNetworkPage } from "../pages/ValidatorNetworkPage";
import { PrivacyPage } from "../pages/PrivacyPage";
import { AttackLabPage } from "../pages/AttackLabPage";
import { SecurityDashboardPage } from "../pages/SecurityDashboardPage";
import { ArchitecturePage } from "../pages/ArchitecturePage";
import { ApiDocsPage } from "../pages/ApiDocsPage";
import { AboutPage } from "../pages/AboutPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: "dashboard", element: <DashboardPage /> },
      { path: "demo", element: <DemoModePage /> },
      { path: "verify", element: <PublicVerificationPage /> },
      { path: "elections", element: <ElectionsPage /> },
      { path: "elections/new", element: <CreateElectionPage /> },
      { path: "evidence", element: <EvidenceExplorerPage /> },
      { path: "evidence/:id", element: <EvidenceExplorerPage /> },
      { path: "merkle", element: <MerkleExplorerPage /> },
      { path: "audits", element: <AuditPage /> },
      { path: "validators", element: <ValidatorNetworkPage /> },
      { path: "privacy", element: <PrivacyPage /> },
      { path: "attack-lab", element: <AttackLabPage /> },
      { path: "security", element: <SecurityDashboardPage /> },
      { path: "architecture", element: <ArchitecturePage /> },
      { path: "api-docs", element: <ApiDocsPage /> },
      { path: "about", element: <AboutPage /> },
      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },
]);
