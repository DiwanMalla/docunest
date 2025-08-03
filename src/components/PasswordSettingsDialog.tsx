"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Shield, Save, Eye, EyeOff } from "lucide-react";

interface PasswordSettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: { passwordEnabled: boolean; password?: string }) => void;
  loading?: boolean;
  error?: string;
  documentTitle?: string;
  currentPasswordEnabled?: boolean;
}

export function PasswordSettingsDialog({
  isOpen,
  onClose,
  onSave,
  loading = false,
  error,
  documentTitle,
  currentPasswordEnabled = false,
}: PasswordSettingsDialogProps) {
  const [passwordEnabled, setPasswordEnabled] = useState(
    currentPasswordEnabled
  );
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError("");

    if (passwordEnabled) {
      if (!password.trim()) {
        setValidationError("Password is required when protection is enabled");
        return;
      }

      if (password !== confirmPassword) {
        setValidationError("Passwords do not match");
        return;
      }

      if (password.length < 6) {
        setValidationError("Password must be at least 6 characters long");
        return;
      }
    }

    onSave({
      passwordEnabled,
      password: passwordEnabled ? password : undefined,
    });
  };

  const handleClose = () => {
    setPassword("");
    setConfirmPassword("");
    setValidationError("");
    setPasswordEnabled(currentPasswordEnabled);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            Download Password Protection
          </DialogTitle>
          <DialogDescription>
            {documentTitle ? (
              <>
                Configure password protection for downloads of &ldquo;
                {documentTitle}&rdquo;. When enabled, guests will need to enter
                a password to download this document.
              </>
            ) : (
              "Configure password protection for document downloads."
            )}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 py-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="password-protection">
                  Enable Password Protection
                </Label>
                <p className="text-sm text-gray-500">
                  Require a password for guests to download this document
                </p>
              </div>
              <Switch
                id="password-protection"
                checked={passwordEnabled}
                onCheckedChange={setPasswordEnabled}
                disabled={loading}
              />
            </div>

            {passwordEnabled && (
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="password">Download Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter a strong password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading}
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <Input
                    id="confirm-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={loading}
                  />
                </div>

                <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                  <p className="font-medium mb-1">Password Requirements:</p>
                  <ul className="text-xs space-y-1">
                    <li>• At least 6 characters long</li>
                    <li>
                      • Use a combination of letters, numbers, and symbols
                    </li>
                    <li>• Make it memorable but not easily guessable</li>
                  </ul>
                </div>
              </div>
            )}

            {(validationError || error) && (
              <p className="text-sm text-red-600">{validationError || error}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Settings
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
