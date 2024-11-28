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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Copy, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useRequest, useUpdateEffect } from "ahooks";
import request from "@/lib/request";
import Loader from "@/components/ui/loader";
import { ClientDataType } from "@/lib/admin";
import Link from "next/link";
import CopyButton from "@/components/CopyButton";

function getList(
  current: number,
  pageSize: number
): Promise<{
  list: ClientDataType[];
  current: number;
  pageSize: number;
  totals: number;
}> {
  return request(`/api/client?current=${current}&pageSize=${pageSize}`);
}

export default function List() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [currentData, setCurrentData] = useState({
    client_id: "",
    active: true,
  });
  const [switchLoading, setLoading] = useState(false);
  const { data, loading, run, refresh, mutate } = useRequest(
    (current: number = 1, pageSize: number = 100) =>
      getList(current, pageSize).then((res) => {
        return res.list;
      }),
    {}
  );

  const handleConfirm = ({
    client_id,
    active,
  }: {
    client_id?: string;
    active?: boolean;
  } = currentData) => {
    setLoading(true);

    request(`/api/client/${client_id}`, {
      method: "POST",
      body: JSON.stringify({
        active,
      }),
    })
      .then((res) => {
        setOpen(false);
        setCurrentData({
          client_id: "",
          active: true,
        });
        mutate((old) =>
          old?.map((i) => {
            if (i.client_id === client_id) {
              return {
                ...i,
                active,
              };
            }
            return i;
          })
        );
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div className="w-full flex-auto max-w-7xl m-auto flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <span className="text-2xl font-semibold">My Clients</span>
        <Button
          variant={"default"}
          size={"default"}
          icon={<Plus size={16} />}
          type="button"
          className="inline-flex items-center gap-1"
          onClick={() => {
            router.push("/admin/list/add");
          }}
        >
          Add
        </Button>
      </div>

      <div className="flex-auto min-h-0 relative">
        <Loader className="top-12" loading={loading}>
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-200 hover:!bg-slate-200">
                <TableHead className="w-40">Name</TableHead>
                <TableHead>Client Id</TableHead>
                <TableHead>Activate</TableHead>
                <TableHead className="w-40">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(data || []).map((item, index) => (
                <TableRow className="h-14" key={item.client_id}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <span>{item.client_id}</span>
                      <CopyButton textToCopy={item.client_id} />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={item.active}
                      loading={item.client_id === currentData.client_id}
                      onCheckedChange={(checked) => {
                        setCurrentData({
                          client_id: item.client_id!,
                          active: checked,
                        });
                        if (checked) {
                          handleConfirm({
                            client_id: item.client_id!,
                            active: checked,
                          });
                        } else {
                          setOpen(true);
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Link
                      className="p-1 text-primary hover:text-primary/90"
                      href={`/admin/list/update?clientId=${item.client_id}`}
                    >
                      Edit
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Loader>
      </div>
      <Dialog open={open}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deactivate Client</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            This client will be deactivate immediately. Once deactivate, it can
            no longer be used to make oAuth Login.
          </DialogDescription>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button loading={switchLoading} onClick={() => handleConfirm()}>
              Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
