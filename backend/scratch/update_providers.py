import sqlite3

def check_and_update():
    conn = sqlite3.connect('audius.db')
    cursor = conn.cursor()
    
    print("Estado actual:")
    cursor.execute("SELECT provider, status, priority FROM api_configs")
    rows = cursor.fetchall()
    for row in rows:
        print(row)
    
    print("\nActualizando...")
    # Desactivar KIE
    cursor.execute("UPDATE api_configs SET status='inactive', priority=99 WHERE provider='KIE'")
    # Activar MODAL
    cursor.execute("UPDATE api_configs SET status='active', priority=1 WHERE provider='MODAL'")
    
    conn.commit()
    
    print("\nEstado nuevo:")
    cursor.execute("SELECT provider, status, priority FROM api_configs")
    rows = cursor.fetchall()
    for row in rows:
        print(row)
    
    conn.close()

if __name__ == "__main__":
    check_and_update()
