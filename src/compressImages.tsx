import { showToast, Toast, getSelectedFinderItems, getPreferenceValues } from "@raycast/api";
import { exec } from "child_process";
import { checkZipicInstallation } from "./utils/checkInstall";

// Define the interface for compression options
interface CompressionPreferences {
  level: number;
  format: string;
  location: string;
  directory: string;
  width: number;
  height: number;
  addSuffix: boolean;
  suffix: string;
  addSubfolder: boolean;
  specified: boolean;
}

export default async function main() {
  const isInstalled = await checkZipicInstallation();
  if (!isInstalled) {
    return;
  }

  let filePaths: string[];

  try {
    // Get user preferences
    const preferences = getPreferenceValues<CompressionPreferences>();

    filePaths = (await getSelectedFinderItems()).map((f) => f.path);
    if (filePaths.length > 0) {
      // 构建 URL 参数
      let urlParams = "";

      // 添加所有文件路径作为 url 参数
      filePaths.forEach((path) => {
        urlParams += `url=${encodeURIComponent(path)}&`;
      });

      // 添加压缩选项
      if (preferences.level) {
        urlParams += `level=${preferences.level}&`;
      }

      if (preferences.format && preferences.format !== "original") {
        urlParams += `format=${preferences.format}&`;
      }

      if (preferences.location) {
        urlParams += `location=${preferences.location}&`;

        // 只有当 location 为 custom 时才处理 directory 和 specified
        if (preferences.location === "custom") {
          if (preferences.specified) {
            urlParams += `specified=true&`;
          } else if (preferences.directory) {
            urlParams += `directory=${encodeURIComponent(preferences.directory)}&`;
          }
        }
      }

      if (preferences.width > 0) {
        urlParams += `width=${preferences.width}&`;
      }

      if (preferences.height > 0) {
        urlParams += `height=${preferences.height}&`;
      }

      if (preferences.addSuffix) {
        urlParams += `addSuffix=${preferences.addSuffix}&`;
        if (preferences.suffix) {
          urlParams += `suffix=${encodeURIComponent(preferences.suffix)}&`;
        }
      }

      if (preferences.addSubfolder) {
        urlParams += `addSubfolder=${preferences.addSubfolder}&`;
      }

      // 移除最后一个 & 符号
      if (urlParams.endsWith("&")) {
        urlParams = urlParams.slice(0, -1);
      }

      const url = `zipic://compress?${urlParams}`;
      await showToast({
        style: Toast.Style.Success,
        title: "Compressing with Zipic",
        message: "Using your configured compression options",
      });
      exec(`open "${url}"`);
    } else {
      await showToast({
        style: Toast.Style.Failure,
        title: "Warning! No Finder items selected",
      });
    }
  } catch (e) {
    await showToast({
      style: Toast.Style.Failure,
      title: "Error",
      message: e instanceof Error ? e.message : "Could not get the selected Finder items",
    });
  }
}
