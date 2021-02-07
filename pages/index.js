import React, { useState, useEffect, useRef } from "react";
import Head from "../components/head";
import Container from "@material-ui/core/Container";
import Box from "@material-ui/core/Box";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import Notice from "../components/notice";
import TranscriptField from "../components/transcriptField";

const Home = () => {
  // 音声認識インスタンス
  const recognizerRef = useRef();
  // スナックバー表示
  const [alertOpen, setAlertOpen] = useState(false); // 自慢検知アラート
  // 音声認識
  const [detecting, setDetecting] = useState(false); // 音声認識ステータス
  const [finalText, setFinalText] = useState(""); // 確定された文章
  const [transcript, setTranscript] = useState("ボタンを押して検知開始"); // 認識中の文章
  // 効果音
  const [userMusic, setUserMusic] = useState(null); // ユーザー追加音
  // 正規表現
  const [katakanaAll, setRegexp] = useState("アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲンァィゥェォャュョッ"); 

  useEffect(() => {
    const music = new Audio("/static/warning01.mp3"); // デフォルト音
    const isAndroid = window.navigator.userAgent.includes("Android"); // Android chrome用のフラグ
    // NOTE: Web Speech APIが使えるブラウザか判定
    // https://developer.mozilla.org/ja/docs/Web/API/Web_Speech_API
    if (!window.SpeechRecognition && !window.webkitSpeechRecognition) {
      alert("お使いのブラウザには未対応です");
      return;
    }
    // NOTE: 将来的にwebkit prefixが取れる可能性があるため
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    recognizerRef.current = new SpeechRecognition();
    recognizerRef.current.lang = "ja-JP";
    recognizerRef.current.interimResults = true;
    recognizerRef.current.continuous = true;
    recognizerRef.current.onstart = () => {
      setDetecting(true);
    };
    recognizerRef.current.onend = () => {
      setDetecting(false);
      if (isAndroid && !alertOpen) {
        recognizerRef.current.start();
      }
    };
    recognizerRef.current.onresult = event => {
      [...event.results].slice(event.resultIndex).forEach(result => {
        const transcript = result[0].transcript;
        setTranscript(transcript);
        if (result.isFinal) {
          //if (tagValues.some(value => transcript.includes(value))) {
          var isKatakana = false;
          for (var i=0; i < transcript.length; i++){
            if (katakanaAll.indexOf(transcript.charAt(i),0) >= 0) {
               isKatakana = true;
               break;
            }
          }
          // カタカナが存在していた場合
          if (isKatakana) {
            (userMusic || music).play();
            setAlertOpen(true);
          }
          // 音声認識が完了して文章が確定
          setFinalText(prevState => {
            // Android chromeなら値をそのまま返す
            return isAndroid ? transcript : prevState + transcript;
          });
          // 文章確定したら候補を削除
          setTranscript("");
        }
      });
    };
  });

  return (
    <div>
      <Head title="カタカナ判定" />
      <Notice
        open={alertOpen}
        severity="error"
        onClose={() => {
          setAlertOpen(false);
        }}
      >
        カタカナを検知しました
      </Notice>
      <Container>
        <Grid container alignItems="center" justify="center">
          <Grid item>
            <img src="/static/logo.png" height="200px" alt="カタカナ禁止" />
          </Grid>
        </Grid>
        <Box fontSize={25}>
          <TranscriptField
            finalText={finalText}
            transcript={transcript}
            isMatch={alertOpen}
          />
        </Box>
        <Box m={2}>
          <Grid container alignItems="center" justify="center">
            <Grid item>
              <Button
                variant="outlined"
                disabled={detecting}
                color="secondary"
                size="large"
                onClick={() => {
                  recognizerRef.current.start();
                }}>
                {detecting ? "検知中..." : "検知開始"}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </div>
  );
};

export default Home;
