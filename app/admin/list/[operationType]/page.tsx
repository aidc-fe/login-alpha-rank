"use client";

import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import request from "@/lib/request";
import { Loader, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEventHandler, useEffect, useState } from "react";
import {
  OPERATION_TYPE,
  scopeOptions,
  defaultClientInfo,
} from "@/constants/admin";
import { upperFirst } from "lodash";
import { cn } from "@/lib/utils";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

type Info = {
  redirect_uris: string[];
  scope: string[];
  name: string;
  description?: string;
  signout_url: string;
};

const mock = {
  redirect_uris: "https://122,https://122999",
  scope: "email,openid,profile,shopify,shoplazza",
  name: "山月",
  signout_url: "https://33",
  description: "ddd",
};

const inputClass =
  "border-input hover:border-zinc-500 focus-visible:ring-zinc-900";

export default function EditClient({
  params,
  searchParams,
}: {
  params: { operationType: OPERATION_TYPE };
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const operationType = params.operationType;
  const clientId = searchParams.clientId as string;
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState<Info>(defaultClientInfo);

  useEffect(() => {
    if (operationType === OPERATION_TYPE.EDIT && clientId) {
      setInfo({
        ...mock,
        redirect_uris: mock.redirect_uris.split(","),
        scope: mock.scope.split(","),
      });
      // setLoading(true);
      // request
      //   .get(`/admin/clients/${clientId}`)
      //   .then((res) => {
      //     setLoading(false);
      //     setInfo(res.data);
      //   })
      //   .catch((err) => {
      //     setLoading(false);
      //     console.error(err);
      //   });
    }
  }, [clientId]);

  const handleSubmit: FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    const params = {
      ...info,
      redirect_uris: info.redirect_uris.join(","),
      scope: info.scope.join(","),
    };
    request('/api/client', {
      method: 'POST',
      body: JSON.stringify(params),
    })
    .then((res) => {
      console.log(res);
    })
    .catch((err) => {
      console.log(err);
    })
  };

  return (
    <>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/admin/list">My Client</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{upperFirst(operationType)} Client</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="flex gap-4 mt-4 flex-col xl:gap-8 xl:flex-row">
        <form
          className="flex-auto flex flex-col gap-4 w-full max-w-7xl m-auto"
          onSubmit={handleSubmit}
        >
          <div className="font-semibold text-2xl mb-2 self-start">{`${upperFirst(
            operationType
          )} Client`}</div>

          <div className="px-3 flex flex-col gap-4">
            <Input
              className={inputClass}
              name="name"
              label="name"
              placeholder="Please enter name"
              required
              value={info.name}
              onChange={(e) => {
                setInfo({ ...info, name: e.target.value });
              }}
            />

            <Textarea
              className={inputClass}
              name="description"
              label="description"
              placeholder="Please enter your description"
              value={info.description}
              onChange={(e) => {
                setInfo({ ...info, description: e.target.value });
              }}
            />

            <div className="w-full flex flex-col gap-1">
              <span className="text-muted-foreground capitalize text-sm">
                Redirect URL:
              </span>
              <div className="bg-slate-100 rounded-xl px-4 py-6">
                {info.redirect_uris.map((item, index) => (
                  <div
                    key={`redirect_uri${index}`}
                    className={cn(
                      "w-full grid grid-cols-[1fr_auto] gap-2 items-center mb-4",
                      {
                        "grid-cols-1": !index,
                      }
                    )}
                  >
                    <Input
                      className={`h-10 ${inputClass}`}
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
                    <Button
                      size={"icon"}
                      variant={"secondary"}
                      className={cn({ hidden: !index })}
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
                <div className="text-right">
                  <Button
                    type="button"
                    className="inline-flex items-center gap-1"
                    onClick={() =>
                      setInfo({
                        ...info,
                        redirect_uris: [...info.redirect_uris, ""],
                      })
                    }
                  >
                    <Plus size={20} />
                    Add
                  </Button>
                </div>
              </div>
            </div>

            <Input
              className={inputClass}
              label="signout url"
              name="signout_url"
              placeholder="Please enter signout url"
              required
              type="url"
              pattern="^(https?|ftp)://.+"
              value={info.signout_url}
              onChange={(e) => {
                setInfo({ ...info, signout_url: e.target.value });
              }}
            />

            <div className="w-full text-left">
              <div className="text-muted-foreground text-sm">Scope:</div>
              <div className="flex items-center gap-4 mt-2">
                {scopeOptions.map((key) => (
                  <div className="inline-flex items-center gap-2" key={key}>
                    <Checkbox
                      id={key}
                      checked={info.scope.includes(key)}
                      onClick={() => {
                        if (info.scope.includes(key)) {
                          const new_scope = info.scope.filter(
                            (item) => item !== key
                          );
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
          </div>

          <div className="px-6 flex mt-8 w-full justify-end">
            <Button variant={"default"} type="submit" disabled={loading}>
              {loading && <Loader className="animate-spin" />}
              {`${upperFirst(operationType)}`}
            </Button>
          </div>
        </form>
        {operationType === OPERATION_TYPE.EDIT ? (
          <div className="flex-shrink-0 -order-1 flex flex-col gap-4 w-96 static xl:order-1 xl:sticky xl:top-24 xl:self-start z-0">
            <div className="text-2xl font-semibold">Additional Information</div>
            <div className="flex flex-col gap-2 pl-3">
              <div className="text-base text-foreground flex items-center">
                Client Id
              </div>
              <div className="text-sm text-muted-foreground break-all">
                1007716595573-lh1kkfk4vpaagj247ev7q3uj0t9i99k7.apps.googleusercontent.com
              </div>
            </div>
            <div className="flex flex-col gap-2 pl-3">
              <div className="text-base text-foreground flex items-center">
                Client Sccret
              </div>
              <div className="text-sm text-muted-foreground break-all">
                1007716595573-lh1kkfk4vpaagj247ev7q3uj0t9i99k7.apps.googleusercontent.com
              </div>
            </div>
            <div className="flex flex-col gap-2 pl-3">
              <div className="text-base text-foreground flex items-center">
                Create Time
              </div>
              <div className="text-sm text-muted-foreground break-all">
                August 28, 2024 at 8:00:04 PM GMT+8
              </div>
            </div>
            <div className="flex flex-col gap-2 pl-3">
              <div className="text-base text-foreground flex items-center">
                Update Time
              </div>
              <div className="text-sm text-muted-foreground break-all">
                August 28, 2024 at 8:00:04 PM GMT+8
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </>
  );
}
