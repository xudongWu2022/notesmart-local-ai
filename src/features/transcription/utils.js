// 计算最长公共子序列长度的辅助函数
function getLCS(str1, str2) {
  const m = str1.length;
  const n = str2.length;
  const dp = Array(m + 1).fill().map(() => Array(n + 1).fill(0));

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  // 回溯找出差异
  let diff = '';
  let i = m, j = n;
  while (i > 0 && j > 0) {
    if (str1[i - 1] === str2[j - 1]) {
      i--; j--;
    } else if (dp[i - 1][j] > dp[i][j - 1]) {
      i--;
    } else {
      diff = str2[j - 1] + diff;
      j--;
    }
  }
  while (j > 0) {
    diff = str2[j - 1] + diff;
    j--;
  }

  return diff;
}

export const getTranscriptText = (transcripts, interimResult, prevInterimRef) => {
  // 历史文本处理（已确认的文本）
  const historicalText = transcripts.map(t => t.text).join(' ');

  // 临时文本处理（带置信度判断）
  let incrementalText = '';
  if (interimResult?.text && interimResult.confidence >= 0.9) {
    const currentInterim = interimResult.text;
    const prevInterim = prevInterimRef.current;

    if (currentInterim !== prevInterim) {
      // 找出新增的部分
      incrementalText = getLCS(prevInterim, currentInterim);
      prevInterimRef.current = currentInterim;
    }
  } else {
    prevInterimRef.current = '';
  }

  return { historicalText, incrementalText };
};

// 新增：处理转录结果的函数
export const processTranscript = (data) => {
  const transcript = data?.channel?.alternatives?.[0];
  if (!transcript) return null;

  // 只有当置信度达到阈值时才处理
  if (transcript.confidence >= 0.9) {
    return {
      text: transcript.transcript,
      isFinal: data.is_final,
      confidence: transcript.confidence,
      timestamp: Date.now()
    };
  }
  return null;
};
