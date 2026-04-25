import sqlite3

def update_db():
    db_file = 'gen_audius_dev.db'
    conn = sqlite3.connect(db_file)
    cursor = conn.cursor()
    
    # Desactivar todos los KIE (KIE y KIE-SUNO)
    cursor.execute("UPDATE api_configs SET status='inactive', priority=99 WHERE provider IN ('KIE', 'KIE-SUNO')")
    # Activar MODAL con prioridad 1
    cursor.execute("UPDATE api_configs SET status='active', priority=1 WHERE provider='MODAL'")
    
    conn.commit()
    
    print("Estado actualizado en DB:")
    cursor.execute("SELECT provider, status, priority FROM api_configs WHERE provider IN ('KIE', 'KIE-SUNO', 'MODAL')")
    for row in cursor.fetchall():
        print(row)
    
    conn.close()

if __name__ == "__main__":
    update_db()
