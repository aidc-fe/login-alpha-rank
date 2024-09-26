// app/providers.js
"use client";

import type { Session } from "next-auth";
import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";
// import { useEffect, useState } from "react";

export default function SessionProvider({
  children,
  session,
}: {
  children: React.ReactNode;
  session?: Session;
}) {
  // const [aa, setAa] = useState(false);
  // useEffect(() => {
  //   document.hasStorageAccess().then((res) => {
  //     if (!res) {
  //       // 如果没有存储访问权限，动态创建一个按钮
  //       const button = document.createElement("button");
  //       button.innerText = "请求存储访问权限";

  //       // 给按钮添加点击事件监听器
  //       button.onclick = () => {
  //         document
  //           .requestStorageAccess()
  //           .then(() => {
  //             setAa(true);

  //             // 访问权限被授予后，移除按钮
  //             button.remove();
  //           })
  //           .catch((error) => {});
  //       };

  //       // 将按钮插入到页面中
  //       document.body.appendChild(button);

  //       // 模拟用户点击按钮
  //       button.click();
  //     }
  //   });
  // }, []);
  return (
    // aa && (
    <NextAuthSessionProvider session={session}>
      {children}
    </NextAuthSessionProvider>
    // )
  );
}
