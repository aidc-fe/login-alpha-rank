"use client";

import { Plus } from "lucide-react";
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
  Spinner,
} from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useRequest } from "ahooks";
import request from "@/lib/request";
import Loader from "@/components/ui/loader";
import { BusinessDomainDataType } from "@/lib/admin";
import Link from "next/link";
import CopyButton from "@/components/CopyButton";

// 类型定义
interface SwitchState {
  id: string;
  active: boolean;
  sso: boolean;
  type: 'active' | 'sso';
}

// 独立的 API 调用函数
const getList = (): Promise<BusinessDomainDataType[]> => request(`/api/businessDomain`);

const updateBusinessDomain = async (id: string, data: Partial<BusinessDomainDataType>) => {
  return request(`/api/businessDomain/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
};

// 表格列定义
const columns = [
  { key: "name", label: "Name" },
  { key: "id", label: "Business Domain Id" },
  { key: "active", label: "Activate" },
  { key: "sso", label: "Enable SSO" },
  { key: "actions", label: "Action", width: "w-40" },
];

// 开关组件
const LoadingSwitch = ({ 
  isSelected, 
  isLoading, 
  onValueChange,
  disabled 
}: {
  isSelected: boolean;
  isLoading: boolean;
  onValueChange: (checked: boolean) => void;
  disabled?: boolean;
}) => (
  <Switch
    isSelected={isSelected}
    disabled={disabled || isLoading}
    thumbIcon={isLoading ? (
      <Spinner
        size="sm"
        classNames={{
          wrapper: "scale-75",
        }}
      />
    ) : null}
    onValueChange={onValueChange}
  />
);

// 确认弹窗组件
const DeactivateModal = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
}) => (
  <Modal isOpen={isOpen} onOpenChange={onClose}>
    <ModalContent>
      {(onClose) => (
        <>
          <ModalHeader>Deactivate Client</ModalHeader>
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
              isLoading={isLoading}
              color="primary"
              onClick={onConfirm}
            >
              Continue
            </Button>
          </ModalFooter>
        </>
      )}
    </ModalContent>
  </Modal>
);

export default function List() {
  const router = useRouter();
  const [currentData, setCurrentData] = useState<SwitchState>({
    id: "",
    active: true,
    sso: false,
    type: "active",
  });
  const [switchLoading, setLoading] = useState(false);
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();

  const { data, loading, mutate } = useRequest(getList, {
    onError: (err) => {
      console.error('Failed to fetch business domains:', err);
    }
  });

  const handleSwitchChange = async (
    id: string,
    type: 'active' | 'sso',
    checked: boolean,
    item: BusinessDomainDataType
  ) => {
    setCurrentData({
      id,
      active: type === 'active' ? checked : item.active,
      sso: type === 'sso' ? checked : item.sso,
      type,
    });

    if (type === 'active' && !checked) {
      onOpen();
      return;
    }

    await handleConfirm({
      id,
      active: type === 'active' ? checked : item.active,
      sso: type === 'sso' ? checked : item.sso
    });
  };

  const handleConfirm = async ({ id, active, sso }: { id: string, active: boolean, sso: boolean } = currentData) => {
    setLoading(true);
    try {
      await updateBusinessDomain(id, { active, sso });
      
      mutate((old) =>
        old?.map((item) =>
          item.id === id ? { ...item, active, sso } : item
        )
      );
      
      onClose();
    } catch (error) {
      console.error('Failed to update business domain:', error);
    } finally {
      setLoading(false);
      setCurrentData({ id: "", active: true, sso: false, type: "active" });
    }
  };

  const isLoading = (id: string, type: "active" | "sso") => 
    currentData.id === id && currentData.type === type && switchLoading;

  return (
    <div className="w-full flex-auto max-w-7xl m-auto flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <span className="text-2xl font-semibold">My Business Domain</span>
        <Button
          startContent={<Plus size={16} />}
          onClick={() => router.push("/admin/businessDomain/add")}
        >
          Add
        </Button>
      </div>

      <div className="flex-auto min-h-0 relative">
        <Loader className="top-12" loading={loading}>
          <Table removeWrapper>
            <TableHeader>
              {columns.map((column) => (
                <TableColumn key={column.key} className={column.width}>
                  {column.label}
                </TableColumn>
              ))}
            </TableHeader>
            <TableBody>
              {(data || []).map((item) => (
                <TableRow key={item.id} className="h-14">
                  <TableCell>
                    <Link
                      className="hover:underline hover:text-primary"
                      href={`/admin/businessDomain/detail/${item.id}`}
                    >
                      {item.name}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <span>{item.id}</span>
                      <CopyButton textToCopy={item.id} />
                    </div>
                  </TableCell>
                  <TableCell>
                    <LoadingSwitch
                      isSelected={item.active}
                      isLoading={isLoading(item.id, "active")}
                      onValueChange={(checked) => 
                        handleSwitchChange(item.id!, "active", checked, item)
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <LoadingSwitch
                      isSelected={item.sso}
                      isLoading={isLoading(item.id, "sso")}
                      onValueChange={(checked) => 
                        handleSwitchChange(item.id!, "sso", checked, item)
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Link
                      className="p-1 text-primary hover:text-primary/90"
                      href={`/admin/businessDomain/detail/${item.id}`}
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

      <DeactivateModal
        isOpen={isOpen}
        onClose={onClose}
        onConfirm={() => handleConfirm()}
        isLoading={switchLoading}
      />
    </div>
  );
}
