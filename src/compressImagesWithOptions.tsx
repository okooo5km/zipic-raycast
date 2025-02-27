import {
  Action,
  ActionPanel,
  Form,
  showToast,
  Toast,
  getSelectedFinderItems,
  getPreferenceValues,
  useNavigation,
} from "@raycast/api";
import { exec } from "child_process";
import { useState, useEffect } from "react";
import { checkZipicInstallation } from "./utils/checkInstall";

// 定义压缩选项接口
interface CompressionOptions {
  level: string;
  format: string;
  location: string;
  directory: string;
  width: string;
  height: string;
  addSuffix: boolean;
  suffix: string;
  addSubfolder: boolean;
  specified: boolean;
}

// 定义表单值接口
interface FormValues {
  level: string;
  format: string;
  location: string;
  directory: string[];
  width: string;
  height: string;
  addSuffix: boolean;
  suffix: string;
  addSubfolder: boolean;
  specified: boolean;
}

export default function Command() {
  const { pop } = useNavigation();
  const [isLoading, setIsLoading] = useState(true);
  const [filePaths, setFilePaths] = useState<string[]>([]);
  const [isInstalled, setIsInstalled] = useState(false);

  // 获取默认偏好设置
  const preferences = getPreferenceValues<CompressionOptions>();

  // 初始化表单值
  const [formValues, setFormValues] = useState<FormValues>({
    level: preferences.level?.toString() || "3.0",
    format: preferences.format || "original",
    location: preferences.location || "original",
    directory: preferences.directory ? [preferences.directory] : [],
    width: preferences.width?.toString() || "0",
    height: preferences.height?.toString() || "0",
    addSuffix: preferences.addSuffix || false,
    suffix: preferences.suffix || "-compressed",
    addSubfolder: preferences.addSubfolder || false,
    specified: preferences.specified || false,
  });

  // 检查 Zipic 是否已安装并获取选中的文件
  useEffect(() => {
    async function initialize() {
      const zipicInstalled = await checkZipicInstallation();
      setIsInstalled(zipicInstalled);

      if (zipicInstalled) {
        try {
          const selectedItems = await getSelectedFinderItems();
          const paths = selectedItems.map((item) => item.path);

          if (paths.length === 0) {
            await showToast({
              style: Toast.Style.Failure,
              title: "No Files Selected",
              message: "Please select files in Finder before running this command",
            });
            pop();
            return;
          }

          setFilePaths(paths);
          setIsLoading(false);
        } catch (error) {
          await showToast({
            style: Toast.Style.Failure,
            title: "Error",
            message: error instanceof Error ? error.message : "Could not get selected Finder items",
          });
          pop();
        }
      } else {
        pop();
      }
    }

    initialize();
  }, []);

  // 处理表单提交
  async function handleSubmit(values: FormValues) {
    if (filePaths.length === 0) {
      await showToast({
        style: Toast.Style.Failure,
        title: "No Files Selected",
      });
      return;
    }

    try {
      // 构建 URL 参数
      let urlParams = "";

      // 添加所有文件路径作为 url 参数
      filePaths.forEach((path) => {
        urlParams += `url=${encodeURIComponent(path)}&`;
      });

      // 添加压缩选项
      if (values.level && values.level !== "0") {
        urlParams += `level=${values.level}&`;
      }

      if (values.format && values.format !== "original") {
        urlParams += `format=${values.format}&`;
      }

      if (values.location) {
        urlParams += `location=${values.location}&`;

        // 只有当 location 为 custom 且 specified 为 false 时，才添加 directory 参数
        if (values.location === "custom") {
          if (values.specified) {
            urlParams += `specified=true&`;
          } else if (values.directory && values.directory.length > 0) {
            urlParams += `directory=${encodeURIComponent(values.directory[0])}&`;
          }
        }
      }

      if (values.width && parseInt(values.width) > 0) {
        urlParams += `width=${values.width}&`;
      }

      if (values.height && parseInt(values.height) > 0) {
        urlParams += `height=${values.height}&`;
      }

      if (values.addSuffix) {
        urlParams += `addSuffix=${values.addSuffix}&`;
        if (values.suffix) {
          urlParams += `suffix=${encodeURIComponent(values.suffix)}&`;
        }
      }

      if (values.addSubfolder) {
        urlParams += `addSubfolder=${values.addSubfolder}&`;
      }

      // 移除最后一个 & 符号
      if (urlParams.endsWith("&")) {
        urlParams = urlParams.slice(0, -1);
      }

      const url = `zipic://compress?${urlParams}`;

      await showToast({
        style: Toast.Style.Success,
        title: "Compressing with Zipic",
        message: `Compressing ${filePaths.length} file(s)`,
      });

      exec(`open "${url}"`);
      pop();
    } catch (error) {
      await showToast({
        style: Toast.Style.Failure,
        title: "Error",
        message: error instanceof Error ? error.message : "Failed to compress images",
      });
    }
  }

  if (!isInstalled) {
    return null;
  }

  return (
    <Form
      isLoading={isLoading}
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Compress Images" onSubmit={handleSubmit} />
        </ActionPanel>
      }
    >
      <Form.Description text={`Selected ${filePaths.length} file(s) for compression`} />

      <Form.Separator />

      <Form.TextField
        id="level"
        title="Compression Level"
        placeholder="3.0"
        info="The higher the level, the greater the compression and the lower the quality (1-6)"
        defaultValue={formValues.level}
      />

      <Form.Dropdown id="format" title="Output Format" defaultValue={formValues.format}>
        <Form.Dropdown.Item value="original" title="Original" />
        <Form.Dropdown.Item value="jpeg" title="JPEG" />
        <Form.Dropdown.Item value="webp" title="WebP" />
        <Form.Dropdown.Item value="heic" title="HEIC" />
        <Form.Dropdown.Item value="avif" title="AVIF" />
        <Form.Dropdown.Item value="png" title="PNG" />
      </Form.Dropdown>

      <Form.Dropdown
        id="location"
        title="Save Location"
        defaultValue={formValues.location}
        onChange={(newValue) => {
          setFormValues({
            ...formValues,
            location: newValue,
            // 如果切换到 original，重置 specified 和 directory
            ...(newValue === "original" ? { specified: false, directory: [] } : {}),
          });
        }}
      >
        <Form.Dropdown.Item value="original" title="Original Location" />
        <Form.Dropdown.Item value="custom" title="Custom Location" />
      </Form.Dropdown>

      {formValues.location === "custom" && (
        <>
          <Form.Checkbox
            id="specified"
            title="Use Default Save Directory"
            label="Use Default Save Directory"
            info="Enable to use Zipic's default save directory instead of specifying one"
            defaultValue={formValues.specified}
            onChange={(value) => setFormValues({ ...formValues, specified: value })}
          />

          {!formValues.specified && (
            <Form.FilePicker
              id="directory"
              title="Save Directory"
              allowMultipleSelection={false}
              canChooseDirectories
              canChooseFiles={false}
              value={formValues.directory}
              onChange={(newValue) => setFormValues({ ...formValues, directory: newValue })}
            />
          )}
        </>
      )}

      <Form.TextField
        id="width"
        title="Width"
        placeholder="0"
        info="Sets the desired width (0 for auto-adjust)"
        defaultValue={formValues.width}
      />

      <Form.TextField
        id="height"
        title="Height"
        placeholder="0"
        info="Sets the desired height (0 for auto-adjust)"
        defaultValue={formValues.height}
      />

      <Form.Checkbox
        id="addSuffix"
        title="Add Suffix"
        label="Add Suffix"
        defaultValue={formValues.addSuffix}
        onChange={(value) => setFormValues({ ...formValues, addSuffix: value })}
      />

      {formValues.addSuffix && (
        <Form.TextField
          id="suffix"
          title="Suffix"
          placeholder="-compressed"
          info="Suffix to add to the compressed file names"
          defaultValue={formValues.suffix}
        />
      )}

      <Form.Checkbox
        id="addSubfolder"
        title="Add Subfolder"
        label="Add Subfolder"
        defaultValue={formValues.addSubfolder}
      />
    </Form>
  );
}
