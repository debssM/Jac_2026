import { createBrowserRouter } from "react-router";
import { WelcomeScreen } from "./components/WelcomeScreen";
import { UploadScreen } from "./components/UploadScreen";
import { AnalysisScreen } from "./components/AnalysisScreen";
import { ResultsScreen } from "./components/ResultsScreen";
import { HeatmapScreen } from "./components/HeatmapScreen";
import { GapsScreen } from "./components/GapsScreen";
import { MemoScreen } from "./components/MemoScreen";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: WelcomeScreen,
  },
  {
    path: "/upload",
    Component: UploadScreen,
  },
  {
    path: "/analyze",
    Component: AnalysisScreen,
  },
  {
    path: "/results",
    Component: ResultsScreen,
  },
  {
    path: "/heatmap",
    Component: HeatmapScreen,
  },
  {
    path: "/gaps",
    Component: GapsScreen,
  },
  {
    path: "/memo",
    Component: MemoScreen,
  },
]);
