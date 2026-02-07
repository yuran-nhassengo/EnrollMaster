"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { BookOpen, X } from "lucide-react"; // Importamos o ícone X
import { useAuth } from "@/app/context/AuthContext";
import { toast } from "sonner";

// Definimos o tipo para bater com o seu Back-end
type Subject = {
  id: string;
  name: string;
};

export default function SubjectsManager() {
  const [subjects, setSubjects] = useState<Subject[]>([]); // Agora guarda o objeto todo
  const [loading, setLoading] = useState(true);
  const [newSubjects, setNewSubjects] = useState<string>("");
  const { user } = useAuth();

  const token = user?.access_token || (typeof window !== "undefined" && JSON.parse(localStorage.getItem("user") || "{}").access_token);

  async function loadSubjects() {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:3001/subjects", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setSubjects(data); // Salvamos o array de objetos [{id, name}, ...]
    } catch {
      toast.error("Erro ao carregar disciplinas.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      const res = await fetch(`http://localhost:3001/subjects/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      
      toast.success("Disciplina removida");
      // Atualiza a lista local removendo a deletada
      setSubjects(subjects.filter((s) => s.id !== id));
    } catch {
      toast.error("Erro ao deletar. Verifique se há cursos usando esta disciplina.");
    }
  }

  useEffect(() => {
    if (token) loadSubjects();
  }, [token]);

  async function handleAddSubjects() {
    if (!newSubjects) return;
    const names = newSubjects.split(",").map((n) => n.trim()).filter((n) => n);
    
    try {
      const res = await fetch("http://localhost:3001/subjects", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ names }),
      });
      if (!res.ok) throw new Error();
      toast.success("Adicionadas com sucesso!");
      setNewSubjects("");
      loadSubjects();
    } catch {
      toast.error("Erro ao salvar.");
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <BookOpen className="w-4 h-4" /> Gestão de Disciplinas
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Gerenciar Disciplinas</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4 border-b">
          <div className="space-y-2">
            <Label>Novas Disciplinas (separadas por vírgula)</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Ex: Física, Química"
                value={newSubjects}
                onChange={(e) => setNewSubjects(e.target.value)}
              />
              <Button onClick={handleAddSubjects}>Adicionar</Button>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <h2 className="font-medium mb-3 text-sm">Disciplinas Cadastradas</h2>
          <div className="flex flex-wrap gap-2 max-h-[250px] overflow-y-auto p-1">
            {loading ? (
              <p className="text-sm text-muted-foreground italic">Carregando...</p>
            ) : subjects.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">Nenhuma encontrada.</p>
            ) : (
              subjects.map((s) => (
                <Badge key={s.id} variant="secondary" className="flex items-center gap-1 pr-1 py-1">
                  {s.name}
                  <button 
                    onClick={() => handleDelete(s.id)}
                    className="hover:bg-destructive hover:text-destructive-foreground rounded-full p-0.5 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}