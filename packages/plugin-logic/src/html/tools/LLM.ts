import { HtmlNode } from "../../node_types";
export const TAL_AI = async (nodes: HtmlNode[]): Promise<any> => {
  try {
    // 1. 将body对象转换为JSON字符串
    const requestBody = JSON.stringify({
      header: {
        schoolCode: "8601" // 添加缺失的 schoolCode
      },
      data: {
        messages: [
            {
            role: "system",
            content: "## 技能\n" +
              "### 技能 1: 补全并优化JSON结构中的类名\n" +
              "1. 读取用户提供的由html转换过来的json结构\n" +
              "2. 为这个json中的每个classID生成有意义且不过长的唯一的类名，不允许通过加数字或者把数字翻译为英文来区分不同的类名，而是要用不同的语义化的非数字的单词去区分类名！\n" +
              "严重错误：{\n" +
              "\"2\" : \"top-div-1\"\n" +
              "\"3\" : \"top-div-2\"\n" +
              "\"4\" : \"top-div-3\"\n" +
              "\"5\" : \"top-div-4\"\n" +
              "\"6\" : \"top-div-5\"\n" +
              "}\n" +
              "严重错误：{\n" +
              "\"2\" : \"top-div-first\"\n" +
              "\"3\" : \"top-div-second\"\n" +
              "\"4\" : \"top-div-third\"\n" +
              "}\n" +
              "3. 输出的结构是classID与你生成的class的键值对，举例：\n" +
              "{\"1\": \"main-container\",\"2\": \"send-btn\"}\n" +
              "4. 注意：你只需要输出键值对即可，不要输出任何其他无意义的内容！\n" +
              "5. 强制要求： 你生成的类名中不允许包含任何数字的内容！而是使用合适的语义化单词区分，不要过长，一定要唯一，不能有重复\n" +
              "## 限制:\n" +
              "- 你输出的结构一定是类似{\"1\": \"main-container\",\"2\": \"send-btn\",}这样的花括号包裹的键值对\n" +
              "- 输出严格按照要求只需要输出键值对的对象Object格式，不要输出任何其他无意义的内容！ \n" +
              "- 你生成的类名一定要唯一，并且不要包含数字！"
          },
          {
            role: "user",
            content: "请你为这个json中的每个classID生成有意义且不过长的唯一的类名的键值对：" + JSON.stringify(nodes)
          }
        ],
        model: "doubao-1.5-thinking-pro",
        extra_body: {
          "reasoning": false
        },
      }
    });
    const response = await fetch('https://beta-one.thethinkacademy.com/v1/practice/edu/client/student/ai/chatCompletions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJ1aWQiOjc1OTg5NjYsImNsaWVudFR5cGUiOiJXRUJfV0VCU0lURSIsImlzcyI6IlVDRU5URVIiLCJpYXQiOjE3NTMxNzA1OTIsImp0aSI6IjczZGJiZTlhIn0.Xd3wnQchmOxWNj9tCHT4lbrCt4WM1FYX5e4kpfaL7STSGUbd-0hQoc-coquqRhmQ5L3AnbumjbncwIn_EfEQhK45OdMAWrqoJqoyRCTg1-Hl7ziSTOK0D7o5pGEtF5ZUvse0MtLlSqmVvfSaIERZbnsmIKreORR-6CXl19WqYtU `
      },
      body: requestBody // 这里必须是字符串
    });
    console.log('API原始响应:', response);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const data = await response.json();
   console.log("API的JSON响应:", data);

    const result = data.data.choices[0].message.content;
    console.log("解析出的响应内容:", result);

    // 处理返回的JSON字符串 - 可能包含代码块标记
    try {
      // 尝试提取JSON代码块中的内容
      const jsonMatch = result.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      const jsonString = jsonMatch ? jsonMatch[1].trim() : result.trim();

      const parsedResult = JSON.parse(jsonString);

      // 验证返回的是有效的键值对对象
      if (parsedResult && typeof parsedResult === 'object' && !Array.isArray(parsedResult)) {
        // 进一步验证键值对格式
        const isValidKeyValue = Object.entries(parsedResult).every(
          ([key, value]) =>
            typeof key === 'string' &&
            typeof value === 'string' &&
            !value.match(/\d/) // 确保值不包含数字
        );

        if (isValidKeyValue) {
          return parsedResult;
        } else {
          throw new Error("返回的键值对格式不符合要求（值包含数字或类型不正确）");
        }
      } else {
        throw new Error("返回的数据不是有效的键值对对象");
      }
    } catch (parseError) {
      console.error('JSON解析错误:', parseError);
      console.error('原始响应内容:', result);
      return {};
    }
  } catch (error) {
    console.error('API调用失败:', error);
    return nodes; // 失败时返回原始节点
  }
}
