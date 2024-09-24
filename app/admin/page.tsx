"use client";

import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import request from "@/lib/request";
import { Loader, Plus, Trash2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEventHandler, useState } from "react";
import * as Switch from '@radix-ui/react-switch';
import { cn } from "@/lib/utils";

const scopeOptions = ['email', 'openid', 'profile', 'shopify', 'shoplazza']; //允许的权限范围。

type Info = {
  redirect_urls: string[],
  scope: string[],
  active: boolean,
  name: string,
  description?: string,
  signout_url: string
}
export default function Admin() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState<Info>({ redirect_urls: [''], scope: [], active: false, name: '', signout_url: '' })


  const handleSubmit: FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    console.log('sdp--info', info)
    // setLoading(true);
    // const formData = new FormData(e.target as HTMLFormElement);
    // const name = formData.get("name");
    // const scope = formData.get("scope");
    // const active = formData.get("active");

    // const email = formData.get("email") as string;
    // const password = formData.get("password") as string;

    // 发送验证邮件
    // request("/api/signUp/email/send", {
    //   method: "POST",
    //   body: JSON.stringify({
    //     name,
    //     email,
    //     password,
    //     targetUrl: searchParams.get("targetUrl"),
    //   }),
    // })
    //   .then(() => {
    //     router.push(
    //       `/email/sent?email=${encodeURIComponent(email || "")}&type=sign_up`
    //     );
    //   })
    //   .catch((err) => {
    //     console.log({ err });
    //   })
    //   .finally(() => {
    //     setLoading(false);
    //   });
  };
  return (
    <div>
      <h1 className="font-bold text-3xl mb-2 w-full text-center">OAuth登录</h1>
      <form
        className="grid grid-cols-1 items-center gap-4 px-8 w-full"
        onSubmit={handleSubmit}
      >
        {info.redirect_urls.map((item, index) => (
          <div className={cn("grid grid-cols-[1fr_auto] gap-2 items-center", { 'grid-cols-1': !index })}>
            <Input
              className='h-10'
              label={index === 0 ? "Redirect URL" : undefined}
              placeholder="Please enter your Redirect URL"
              value={item}
              type="url"
              onChange={(e) => {
                const new_redirect_urls = [...info.redirect_urls];
                new_redirect_urls[index] = e.target.value;
                setInfo({ ...info, redirect_urls: new_redirect_urls });
              }}
              required
            />
            <Trash2
              className={cn('cursor-pointer', { hidden: !index })}
              onClick={() => {
                const new_redirect_urls = [...info.redirect_urls];
                new_redirect_urls.splice(index, 1);
                setInfo({ ...info, redirect_urls: new_redirect_urls });
              }}
            />
          </div>
        ))}
        <Button
          variant={"ghost"}
          size={"default"}
          type="button"
          className="border-dashed border border-gray-400 w-72 inline-flex items-center gap-1"
          onClick={() => setInfo({ ...info, redirect_urls: [...info.redirect_urls, ''] })}
        >
          <Plus size={20} />
          Add Redirect URL
        </Button>

        <div>
          <label className="text-muted-foreground">Scope:</label>
          <div className="flex items-center gap-4 mt-1">
            {scopeOptions.map(key => (
              <div className="inline-flex items-center gap-2">
                <Checkbox id={key} checked={info.scope.includes(key)}
                  onClick={() => {
                    if (info.scope.includes(key)) {
                      const new_scope = info.scope.filter(item => item !== key);
                      setInfo({ ...info, scope: new_scope });
                    } else {
                      const new_scope = [...info.scope, key];
                      setInfo({ ...info, scope: new_scope });
                    }
                  }}
                />
                <label>{key}</label>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 ">
          <Switch.Root
            className="w-11 h-6 rounded-full relative bg-gray-400 data-[state=checked]:bg-primary cursor-pointer" id="active"
            checked={info.active}
            onCheckedChange={(v) => {
              setInfo({ ...info, active: v })
            }}
          >
            <Switch.Thumb className="block w-5 h-5 bg-white rounded-full data-[state=checked]:translate-x-6" />
          </Switch.Root>
          <label className="text-muted-foreground">Whether it is activated</label>
        </div>

        <Input
          name="name"
          label="name"
          placeholder="Please enter your name"
          required
          onChange={(e) => {
            setInfo({ ...info, name: e.target.value });
          }}
        />
        <Textarea
          name="description"
          label="description"
          placeholder="Please enter your description"
          onChange={(e) => {
            setInfo({ ...info, description: e.target.value });
          }}
        />
        <Input
          label="signout url"
          name="signout_url"
          placeholder="Please enter your signout url"
          required
          type="url"
          onChange={(e) => {
            setInfo({ ...info, signout_url: e.target.value });
          }}
        />

        <div className="flex flex-col mt-8 w-full items-center gap-4">
          <Button
            variant={"default"}
            size={"lg"}
            type="submit"
            disabled={loading}
          >
            {loading && <Loader className="animate-spin" />}
            Log in
          </Button>
        </div>
      </form>
    </div>
  );
}
