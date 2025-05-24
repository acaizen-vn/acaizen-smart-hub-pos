
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Trash2, AlertTriangle } from 'lucide-react';

interface DeleteButtonProps {
  onDelete: () => void;
  itemName: string;
  itemType: string;
}

const DeleteButton: React.FC<DeleteButtonProps> = ({ onDelete, itemName, itemType }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleConfirmDelete = () => {
    onDelete();
    setIsDialogOpen(false);
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsDialogOpen(true)}
        className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
      >
        <Trash2 className="h-4 w-4" />
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="glass border-white/30 shadow-2xl max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center text-red-600">
              <AlertTriangle className="mr-2 h-5 w-5" />
              Confirmar Exclusão
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <p className="text-sm text-gray-600">
              Tem certeza que deseja excluir {itemType.toLowerCase()} <strong>"{itemName}"</strong>?
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Esta ação não pode ser desfeita.
            </p>
          </div>
          
          <DialogFooter className="sm:justify-between">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsDialogOpen(false)}
              className="hover:bg-gray-50"
            >
              Cancelar
            </Button>
            <Button 
              type="button" 
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DeleteButton;
