"use client";

import * as React from "react";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface TagInputProps {
    value: string[];
    onChange: (next: string[]) => void;
    placeholder?: string;
    id?: string;
}

export function TagInput({ value, onChange, placeholder, id }: TagInputProps) {
    const [draft, setDraft] = React.useState("");

    const add = () => {
        const v = draft.trim();
        if (!v) return;
        if (value.includes(v)) {
            setDraft("");
            return;
        }
        onChange([...value, v]);
        setDraft("");
    };

    const remove = (tag: string) => {
        onChange(value.filter(t => t !== tag));
    };

    const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            add();
        } else if (e.key === "Backspace" && draft === "" && value.length > 0) {
            remove(value[value.length - 1]);
        }
    };

    return (
        <div>
            <div className="flex flex-wrap gap-2 mb-2">
                {value.map(tag => (
                    <Badge key={tag} variant="secondary" className="pl-2 pr-1 py-1">
                        {tag}
                        <button
                            type="button"
                            onClick={() => remove(tag)}
                            className="ml-1 rounded-full hover:bg-gray-300 p-0.5"
                            aria-label={`Удалить ${tag}`}
                        >
                            <X className="h-3 w-3" />
                        </button>
                    </Badge>
                ))}
            </div>
            <Input
                id={id}
                value={draft}
                onChange={e => setDraft(e.target.value)}
                onKeyDown={onKeyDown}
                onBlur={add}
                placeholder={placeholder ?? "Введите и нажмите Enter"}
            />
        </div>
    );
}
