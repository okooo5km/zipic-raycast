import { getApplications, showToast, Toast, open } from "@raycast/api";

async function isZipicInstalled() {
  try {
    const applications = await getApplications();
    return applications.some(({ bundleId }) => bundleId === "studio.5km.zipic");
  } catch (error) {
    return false;
  }
}

export async function checkZipicInstallation(): Promise<boolean> {
  const isInstalled = await isZipicInstalled();
  if (!isInstalled) {
    const options: Toast.Options = {
      style: Toast.Style.Failure,
      title: "Zipic is not installed.",
      message: "Install it from: https://zipic.app",
      primaryAction: {
        title: "Go to https://zipic.app",
        onAction: (toast) => {
          open("https://zipic.app");
          toast.hide();
        },
      },
    };

    await showToast(options);
  }
  return isInstalled;
}
