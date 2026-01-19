import { useEffect, useState } from "react";
import { PluginUI } from "plugin-ui";
import {
  ConversionMessage,
  Message,
  HTMLPreview,
  ErrorMessage,
} from "types";

/**
 * 应用状态接口定义
 */
interface AppState {
  code: string;           // 生成的代码
  isLoading: boolean;     // 是否正在加载
  htmlPreview: HTMLPreview; // HTML预览内容
}

// 空预览对象
const emptyPreview = { size: { width: 0, height: 0 }, content: "" };

/**
 * 主应用组件
 */
export default function App() {
  // 初始化应用状态
  const [state, setState] = useState<AppState>({
    code: "",
    isLoading: false,
    htmlPreview: emptyPreview,
  });



  /**
   * 处理来自Figma的消息
   */
  useEffect(() => {
    window.onmessage = (event: MessageEvent) => {
      const untypedMessage = event.data.pluginMessage as Message;
      // console.log("[界面] 收到消息:", untypedMessage);

      switch (untypedMessage.type) {
        case "conversionStart":  // 转换开始
          setState((prevState) => ({
            ...prevState,
            code: "",
            isLoading: true,
          }));
          break;

        case "code":  // 代码生成完成
          const conversionMessage = untypedMessage as ConversionMessage;
          setState({
            code: conversionMessage.code,
            htmlPreview: conversionMessage.htmlPreview,
            isLoading: false,
          });
          break;

        case "empty":  // 空选择状态
          setState({
            code: "",
            htmlPreview: emptyPreview,
            isLoading: false,
          });
          break;

        case "error":  // 错误处理
          const errorMessage = untypedMessage as ErrorMessage;
          setState({
            code: `错误 :(
// ${errorMessage.error}`,
            isLoading: false,
            htmlPreview: emptyPreview,
          });
          break;

        default:
          break;
      }
    };

    // 组件卸载时清理
    return () => {
      window.onmessage = null;
    };
  }, []);

  // 模拟错误的函数
  const simulateError = () => {
    const errorMessages = [
      "节点解析失败：不支持的图层类型",
      "Failed to export node. This node may not have any visible layers.",
      "SVG渲染失败： VECTOR:34:36",
      "代码转换超时：请重试",
    ];
    const randomError = errorMessages[Math.floor(Math.random() * errorMessages.length)];
    
    setState({
      code: `
      非常抱歉，转换出现错误 :(
      报错原因： ${randomError}
      `,
      isLoading: false,
      htmlPreview: emptyPreview,
    });
  };

  return (
    <div>
      {/* 演示用的错误模拟按钮
      <div className="p-2 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={simulateError}
          className="w-full bg-red-500 hover:bg-red-600 text-white text-sm font-medium py-2 px-4 rounded transition-colors"
          title="点击以模拟不同类型的错误"
        >
          ⚠️ 模拟错误（演示用）
        </button>
      </div> */}
      <PluginUI
        isLoading={state.isLoading}
        code={state.code}
        htmlPreview={state.htmlPreview}
      />
    </div>
  );
}
