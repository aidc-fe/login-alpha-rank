"use client";
import { Copy, Plus } from "lucide-react";

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Switch,
} from "@nextui-org/react";
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
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();

  const handleConfirm = ({
    client_id,
    active = false,
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
        onClose();
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
          startContent={<Plus size={16} />}
          type="button"
          className="inline-flex items-center gap-1"
          onClick={() => {
            router.push("/admin/client/add");
          }}
        >
          Add
        </Button>
      </div>

      <div className="flex-auto min-h-0 relative">
        <Loader className="top-12" loading={loading}>
          <Table removeWrapper>
            <TableHeader>
              <TableColumn>Name</TableColumn>
              <TableColumn>Client Id</TableColumn>
              <TableColumn>Activate</TableColumn>
              <TableColumn className="w-40">Action</TableColumn>
            </TableHeader>
            <TableBody>
              {(data || []).map((item, index) => (
                <TableRow className="h-14" key={item.client_id}>
                  <TableCell>
                    <Link
                      className="hover:underline hover:text-primary"
                      href={`/admin/client/detail/${item.client_id}`}
                    >
                      {item.name}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <span>{item.client_id}</span>
                      <CopyButton textToCopy={item.client_id} />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Switch
                      isSelected={item.active}
                      // Nextui不存在loading态
                      // loading={item.client_id === currentData.client_id}
                      onValueChange={(checked) => {
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
                          onOpen();
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Link
                      className="p-1 text-primary hover:text-primary/90"
                      href={`/admin/client/detail/${item.client_id}`}
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
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Deactivate Client
              </ModalHeader>
              <ModalBody>
                <p>
                  This client will be deactivate immediately. Once deactivate,
                  it can no longer be used to make oAuth Login.
                </p>
              </ModalBody>
              <ModalFooter>
                <Button variant="faded" onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  isLoading={switchLoading}
                  color="primary"
                  onClick={() => handleConfirm()}
                >
                  Continue
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
