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
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";

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
export default function List() {
  const router = useRouter();
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
          </TableRow>
        </TableHeader>
        <TableBody>
          {list.map((item, index) => (
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
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}