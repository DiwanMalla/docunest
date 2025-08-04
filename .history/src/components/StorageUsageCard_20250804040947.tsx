"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Cloud, HardDrive, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StorageUsage {
  storage: {
    used: {
      bytes: number;
      mb: number;
      gb: number;
    };
    limit: {
      bytes: number;
      gb: number;
    };
    percentage: number;
  };
  resources: {
    used: number;
    limit: number;
  };
  plan: string;
  lastUpdated: string;
  warning?: string;
}

export default function StorageUsageCard() {
  const [usage, setUsage] = useState<StorageUsage | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchUsage = async () => {
    try {
      // Fetch user's notes from database to calculate EdgeStore usage
      const response = await fetch("/api/notes");
      if (response.ok) {
        const data = await response.json();
        const notes = data.notes || [];
        
        // Calculate total storage used from user's files
        const totalSizeBytes = notes.reduce((total: number, note: { fileSize?: number }) => {
          return total + (note.fileSize || 0);
        }, 0);
        
        const totalSizeMB = Math.round(totalSizeBytes / (1024 * 1024));
        const totalSizeGB = Math.round((totalSizeBytes / (1024 * 1024 * 1024)) * 100) / 100;
        
        // EdgeStore limits - 1GB limit
        const limitBytes = 1024 * 1024 * 1024; // 1GB limit
        const limitGB = 1;
        
        const usagePercentage = Math.round((totalSizeBytes / limitBytes) * 100);
        
        // Create usage object
        const calculatedUsage: StorageUsage = {
          storage: {
            used: {
              bytes: totalSizeBytes,
              mb: totalSizeMB,
              gb: totalSizeGB,
            },
            limit: {
              bytes: limitBytes,
              gb: limitGB,
            },
            percentage: usagePercentage,
          },
          resources: {
            used: notes.length,
            limit: 100, // 100 files limit
          },
          plan: "EdgeStore",
          lastUpdated: new Date().toISOString(),
          warning: usagePercentage > 80 ? "Storage usage is high" : undefined,
        };
        
        setUsage(calculatedUsage);
      }
    } catch (error) {
      console.error("Failed to fetch storage usage:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchUsage();
  };

  useEffect(() => {
    fetchUsage();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-base">
            <Cloud className="h-5 w-5 mr-2 text-blue-600" />
            Storage Usage (EdgeStore)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-2 bg-gray-200 rounded mb-4"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!usage) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-base">
            <Cloud className="h-5 w-5 mr-2 text-red-600" />
            Storage Usage (EdgeStore)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">Unable to load storage data</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center text-base">
            <Cloud className="h-5 w-5 mr-2 text-blue-600" />
            Storage Usage (EdgeStore)
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="h-8 w-8 p-0 hover:bg-blue-100"
          >
            <RefreshCw
              className={`h-4 w-4 text-blue-600 ${refreshing ? "animate-spin" : ""}`}
            />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Storage Usage */}
        <div>
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="flex items-center text-gray-700">
              <HardDrive className="h-4 w-4 mr-1" />
              Storage
            </span>
            <span className="font-semibold text-gray-900">
              {usage.storage.used.gb} GB / {usage.storage.limit.gb} GB
            </span>
          </div>
          <Progress value={usage.storage.percentage} className="h-3 bg-gray-200" />
          <div className="flex justify-between text-xs text-gray-600 mt-2">
            <span className="font-medium">{usage.storage.percentage}% used</span>
            <span>
              {Math.round(
                (usage.storage.limit.gb - usage.storage.used.gb) * 100
              ) / 100}{" "}
              GB remaining
            </span>
          </div>
        </div>

        {/* File Count */}
        <div>
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-gray-700">Files</span>
            <span className="font-semibold text-gray-900">
              {usage.resources.used.toLocaleString()} /{" "}
              {usage.resources.limit.toLocaleString()}
            </span>
          </div>
          <Progress
            value={(usage.resources.used / usage.resources.limit) * 100}
            className="h-3 bg-gray-200"
          />
        </div>

        {/* Plan Info */}
        <div className="pt-3 border-t border-blue-200">
          <div className="flex justify-between text-xs text-gray-600">
            <span className="font-medium">Plan: <span className="text-blue-600">{usage.plan}</span></span>
            <span>
              Updated: {new Date(usage.lastUpdated).toLocaleTimeString()}
            </span>
          </div>
          {usage.warning && (
            <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-700">
              ⚠️ {usage.warning}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
