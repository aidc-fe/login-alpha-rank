"use client";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { randomBytes } from "crypto";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useRequest } from "ahooks";

const clientId = randomBytes(16).toString("hex");
const clientSecret = randomBytes(32).toString("hex");

type Item = {
  id: string;
  client_id: string;
  client_secret: string;
  redirect_uris: string[];
  grant_types: string[];
  scope: string[];
  created_at: number;
  updated_at: number;
  active: boolean;
  default: boolean;
  name: string;
  description?: string;
};
const list: Item[] = [
  {
    id: "1",
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uris: [],
    grant_types: ["authorization_code"],
    scope: ["email", "openid"],
    created_at: Date.now(),
    updated_at: Date.now(),
    active: true,
    default: true,
    name: "name",
    description: "description",
  },
  {
    id: "2",
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uris: [],
    grant_types: ["authorization_code"],
    scope: ["profile", "shopify", "shoplazza"],
    created_at: Date.now(),
    updated_at: Date.now(),
    active: true,
    default: false,
    name: "name",
    description: "description",
  },
];

function getList(current: number, pageSize: number): Promise<Item[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(list);
    }, 1000);
  });
}

export default function List() {
  const router = useRouter();
  const [page, setPage] = useState({ current: 1, pageSize: 10, total: 0 });
  const { data, loading, run, refresh } = useRequest(
    (current: number, pageSize: number) => getList(current, pageSize),
    {}
  );

  return (
    <div className="min-h-full max-w-7xl m-auto flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <span className="text-2xl font-semibold">My Clients</span>
        <Button
          variant={"default"}
          size={"default"}
          type="button"
          className="inline-flex items-center gap-1"
          onClick={() => {
            router.push("/admin/list/create");
          }}
        >
          Add
        </Button>
      </div>

      <div className="flex-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-200 hover:!bg-slate-200">
              <TableHead className="w-28">Name</TableHead>
              <TableHead>Client Id</TableHead>
              <TableHead>Activate</TableHead>
              <TableHead className="w-40">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(data || []).map((item, index) => (
              <TableRow key={index}>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.client_id}</TableCell>
                <TableCell>
                  <Switch checked={item.active} />
                </TableCell>
                <TableCell>
                  <Button
                    variant={"ghost"}
                    size={"default"}
                    type="button"
                    className="p-1 text-primary hover:text-primary/90"
                    onClick={() => {
                      router.push(`/admin/list/update?clientId=${item.id}`);
                    }}
                  >
                    Edit
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Pagination className="justify-end">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious href="#" />
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#">1</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#">2</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#">3</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
          <PaginationItem>
            <PaginationNext href="#" />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
