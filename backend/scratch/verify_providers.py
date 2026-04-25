import sys
import os

# Añadir el directorio actual al path para importar servicios
sys.path.append(os.getcwd())

from services.provider_manager import provider_manager

def verify():
    provider_manager.reload()
    chain = provider_manager.get_active_chain()
    
    print("Cadena de proveedores activa:")
    for i, p in enumerate(chain):
        print(f"{i+1}. {p.name} (Priority: {p.priority}, Enabled: {p.enabled})")
    
    if chain and chain[0].name == 'MODAL':
        print("\n✅ ÉXITO: Modal es ahora el proveedor prioritario.")
    else:
        print("\n❌ ERROR: Modal no es el primero en la cadena.")

if __name__ == "__main__":
    verify()
