"use client";

import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import request from "@/lib/request";
import { Loader, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEventHandler, useState } from "react";
import { cn } from "@/lib/utils";

const scopeOptions = ["email", "openid", "profile", "shopify", "shoplazza"]; //允许的权限范围。

type Info = {
  redirect_uris: string[];
  scope: string[];
  name: string;
  description?: string;
  signout_url: string;
};
export default function Admin() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState<Info>({
    redirect_uris: [""],
    scope: [],
    name: "",
    signout_url: "",
  });

  const handleSubmit: FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    const params = {
      ...info,
      redirect_uris: info.redirect_uris.join(","),
      scope: info.scope.join(","),
    };
    console.log("sdp--params", params);
  };

  return (
    <form
      className="flex flex-col items-center gap-4 p-8 w-full max-w-7xl m-auto"
      onSubmit={handleSubmit}
    >
      <h1 className="font-bold text-3xl mb-4">Create Client</h1>

      <Input
        name="name"
        label="name"
        placeholder="Please enter name"
        required
        onChange={(e) => {
          setInfo({ ...info, name: e.target.value });
        }}
      />

      <Input
        label="signout url"
        name="signout_url"
        placeholder="Please enter signout url"
        required
        type="url"
        pattern="^(https?|ftp)://.+"
        onChange={(e) => {
          setInfo({ ...info, signout_url: e.target.value });
        }}
      />

      <div className="w-full text-left">
        {info.redirect_uris.map((item, index) => (
          <div
            key={`redirect_uri${index}`}
            className={cn("w-full grid grid-cols-[1fr_auto] gap-2 items-center mb-4", {
              "grid-cols-1": !index,
            })}
          >
            <Input
              className="h-10"
              label={index === 0 ? "Redirect URL" : undefined}
              placeholder="Please enter your Redirect URL"
              value={item}
              type="url"
              pattern="^(https?|ftp)://.+"
              onChange={(e) => {
                const new_redirect_uris = [...info.redirect_uris];
                new_redirect_uris[index] = e.target.value;
                setInfo({ ...info, redirect_uris: new_redirect_uris });
              }}
              required
            />
            <Button size={"icon"} variant={"secondary"} className={cn({ hidden: !index })}
              onClick={() => {
                const new_redirect_uris = [...info.redirect_uris];
                new_redirect_uris.splice(index, 1);
                setInfo({ ...info, redirect_uris: new_redirect_uris });
              }}
            >
              <Trash2 />
            </Button>
          </div>
        ))}
        <Button
          variant={"outline"}
          type="button"
          className="border-dashed border border-gray-400 w-72 inline-flex items-center gap-1"
          onClick={() =>
            setInfo({ ...info, redirect_uris: [...info.redirect_uris, ""] })
          }
        >
          <Plus size={20} />
          Add Redirect URL
        </Button>
      </div>


      <div className="w-full text-left">
        <label className="inline-flex gap-2 items-center text-muted-foreground">
          Scope:
          <Checkbox
            id="all"
            className="ml-2"
            checked={info.scope.length === scopeOptions.length}
            onClick={() => {
              if (info.scope.length === scopeOptions.length) {
                setInfo({ ...info, scope: [] });
              } else {
                setInfo({ ...info, scope: scopeOptions });
              }
            }}
          />
          <label className="text-black">All</label>
        </label>
        <div className="flex items-center gap-4 mt-1">
          {scopeOptions.map((key) => (
            <div className="inline-flex items-center gap-2" key={key}>
              <Checkbox
                id={key}
                checked={info.scope.includes(key)}
                onClick={() => {
                  if (info.scope.includes(key)) {
                    const new_scope = info.scope.filter((item) => item !== key);
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

      <Textarea
        name="description"
        label="description"
        placeholder="Please enter your description"
        onChange={(e) => {
          setInfo({ ...info, description: e.target.value });
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
          Create Client
        </Button>
      </div>
    </form>
  );
}
