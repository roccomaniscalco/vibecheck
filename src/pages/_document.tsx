import { Head, Html, Main, NextScript } from "next/document";

const Document = () => {
  return (
    <Html style={{ colorScheme: "dark" }}>
      <Head />
      <body className="bg-slate-900 text-slate-200 break-words">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
};

export default Document;
