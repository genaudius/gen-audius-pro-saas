import sqlite3

def check_and_update():
    # El archivo de base de datos correcto según database.py es gen_audius_dev.db
    db_file = 'gen_audius_dev.db'
    conn = sqlite3.connect(db_file)
    cursor = conn.cursor()
    
    print(f"Estado actual en {db_file}:")
    try:
        cursor.execute("SELECT provider, status, priority FROM api_configs")
        rows = cursor.fetchall()
        for row in rows:
            print(row)
    except sqlite3.OperationalError as e:
        print(f"Error: {e}")
        conn.close()
        return
    
    print("\nActualizando...")
    # Desactivar KIE-SUNO (Nombre en DB según database.py)
    cursor.execute("UPDATE api_configs SET status='inactive', priority=99 WHERE provider='KIE-SUNO'")
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
