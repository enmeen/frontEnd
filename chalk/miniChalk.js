const ansi = {
  reset: "\x1b[0m",
  bold: ["\x1b[1m", "\x1b[22m"],
  underline: ["\x1b[4m", "\x1b[24m"],
  blue: ["\x1b[34m", "\x1b[39m"],
  red: ["\x1b[31m", "\x1b[39m"],
  green: ["\x1b[32m", "\x1b[39m"],
  yellow: ["\x1b[33m", "\x1b[39m"],
};

// 创建 Proxy，支持链式调用
function createStyler(styles = []) {
  const fn = (text) => {
    let result = text;
    for (const s of styles) {
      const [open, close] = ansi[s];
      result = open + result + close;
    }
    return result + ansi.reset; // 每次结束时 reset，避免污染终端
  };

  return new Proxy(fn, {
    get(target, prop) {
      if (ansi[prop]) {
        return createStyler([...styles, prop]); // 叠加样式
      }
      return target[prop];
    },
  });
}

const miniChalk = createStyler();

// =====================
// 🎯 使用示例
// =====================
console.log(miniChalk.bold.underline.blue("蓝色加粗下划线"));
console.log(miniChalk.red("红色错误 ❌"));
console.log(miniChalk.green.bold("绿色成功 ✅"));
console.log(miniChalk.yellow.underline("黄色警告 ⚠️"));