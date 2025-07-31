
import React from "react";
import { Crown, Star } from "lucide-react";

export const getPlanBadgeColor = (planName?: string | null) => {
  switch (planName?.toLowerCase()) {
    case "premium":
      return "bg-purple-100 text-purple-700 border-purple-200";
    case "business":
      return "bg-blue-100 text-blue-700 border-blue-200";
    case "basic":
    case "starter":
      return "bg-gray-100 text-gray-700 border-gray-200";
    default:
      return "bg-yellow-100 text-yellow-700 border-yellow-200";
  }
};

export const getPlanIcon = (planName?: string | null) => {
  switch (planName?.toLowerCase()) {
    case "premium":
      return React.createElement(Crown, { className: "h-3 w-3" });
    case "business":
      return React.createElement(Star, { className: "h-3 w-3" });
    default:
      return null;
  }
};
