"use client";

import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
} from "@/components/ui/table";
import { randomBytes } from 'crypto';
import { join } from 'lodash';
import dayjs from "dayjs";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
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
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useRequest } from 'ahooks';

const clientId = randomBytes(16).toString('hex');
const clientSecret = randomBytes(32).toString('hex');

type Item = {
  id: string,
  client_id: string,
  client_secret: string,
  redirect_uris: string[],
  grant_types: string[],
  scope: string[],
  created_at: number,
  updated_at: number,
  active: boolean,
  default: boolean,
  name: string,
  description?: string
}
const list: Item[] = [
  {
    id: '1',
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uris: [],
    grant_types: ['authorization_code'],
    scope: ['email', 'openid'],
    created_at: Date.now(),
    updated_at: Date.now(),
    active: true,
    default: true,
    name: 'name',
    description: 'description'
  },
  {
    id: '2',
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uris: [],
    grant_types: ['authorization_code'],
    scope: ['profile', 'shopify', 'shoplazza'],
    created_at: Date.now(),
    updated_at: Date.now(),
    active: true,
    default: false,
    name: 'name',
    description: 'description'
  }
]

function getList(current: number, pageSize: number): Promise<Item[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(list);
    }, 1000);
  });
}


export default function List() {
  const router = useRouter();
  const [page, setPage] = useState({ current: 1, pageSize: 10, total: 0 })
  const { data, loading, run, refresh } = useRequest((current: number, pageSize: number) => getList(current, pageSize), {
  });


  return (
    <div className="h-screen py-8">
      <Breadcrumb className="pb-12">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>List</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="w-full text-right pb-3">
        <Button
          variant={"default"}
          size={"default"}
          type="button"
          className="inline-flex items-center gap-1"
          onClick={() => {
            router.push('/admin/create')
          }}
        >
          <Plus size={20} />
          Add Client
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">名称</TableHead>
            <TableHead>描述</TableHead>
            <TableHead>重定向 URI</TableHead>
            <TableHead>授权类型</TableHead>
            <TableHead>权限范围</TableHead>
            <TableHead>创建时间</TableHead>
            <TableHead>更新时间</TableHead>
            <TableHead>激活状态</TableHead>
            <TableHead>默认的client</TableHead>
            <TableHead>操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {(data || []).map((item, index) => (
            <TableRow key={index}>
              <TableCell>{item.name}</TableCell>
              <TableCell>{item.description}</TableCell>
              <TableCell>{item.redirect_uris}</TableCell>
              <TableCell>{item.grant_types}</TableCell>
              <TableCell>{join(item.scope, ', ')}</TableCell>
              <TableCell>{dayjs(item.created_at).format("MMM DD, YYYY")}</TableCell>
              <TableCell>{dayjs(item.updated_at).format("MMM DD, YYYY")}</TableCell>
              <TableCell>{item.active ? '已激活' : '未激活'}</TableCell>
              <TableCell>{item.default ? '默认' : '设为默认'}</TableCell>
              <TableCell>
                <Button
                  variant={"ghost"}
                  size={"default"}
                  type="button"
                  className="p-0 text-sky-500"
                  onClick={() => {
                    router.push(`/admin/${item.id}/edit`)
                  }}
                >
                  Edit
                </Button>
                <Popover>
                  <PopoverTrigger>
                    <Button
                      variant={"ghost"}
                      size={"default"}
                      type="button"
                      className="p-0 ml-2 text-sky-500 hover:text-sky-700"
                    >
                      Delete
                    </Button>
                  </PopoverTrigger>
                  {!loading &&
                    <PopoverContent className="w-60">
                      Are you sure to delete this client data?
                      <div className="flex justify-end">
                        <Button
                          variant={"default"}
                          size="sm"
                          type="button"
                          onClick={() => { refresh() }}
                        >
                          OK
                        </Button>
                      </div>
                    </PopoverContent>}
                </Popover>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Pagination>
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
  )
}