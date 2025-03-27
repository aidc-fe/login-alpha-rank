"use client";

import { Button, Input, Textarea } from "@nextui-org/react";
import { useState, ChangeEvent } from "react";
import { toast } from "react-toastify";

import request from "@/lib/request";

interface BusinessDomainFormProps {
  initialData?: {
    name: string;
    description: string;
  };
  onSuccess?: () => void;
}

interface FormData {
  name: string;
  description: string;
}

export default function BusinessDomainForm({ initialData, onSuccess }: BusinessDomainFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: initialData?.name || "",
    description: initialData?.description || "",
  });

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (initialData) {
        // 更新业务域名
        await request("/api/business-domain", {
          method: "PUT",
          body: JSON.stringify(formData),
        });
        toast.success("业务域名更新成功");
      } else {
        // 创建业务域名
        await request("/api/business-domain", {
          method: "POST",
          body: JSON.stringify(formData),
        });
        toast.success("业务域名创建成功");
      }

      onSuccess?.();
    } catch (error) {
      toast.error("操作失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <Input
        id="business-domain-name"
        label={<label htmlFor="business-domain-name">业务域名名称</label>}
        value={formData.name}
        onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange("name", e.target.value)}
        placeholder="请输入业务域名名称"
        required
      />
      <Textarea
        id="business-domain-description"
        label={<label htmlFor="business-domain-description">描述</label>}
        value={formData.description}
        onValueChange={value => handleInputChange("description", value)}
        placeholder="请输入描述"
        rows={2}
      />
      <Button color="primary" isDisabled={loading} isLoading={loading} type="submit">
        {initialData ? "更新" : "创建"}
      </Button>
    </form>
  );
}
