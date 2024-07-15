import eel
import mysql.connector

eel.init('web', allowed_extensions=['.js', '.html'])

# Function to fetch menu items from the database
def get_menu_from_db():
    # Connect to the MySQL database
    conn = mysql.connector.connect(
        host='localhost',
        user='root',
        password='root',
        database='hoteldb'
    )
    cursor = conn.cursor()

    # Fetch menu items from the database
    cursor.execute("SELECT item, price FROM menu")
    menu = cursor.fetchall()

    # Close the database connection
    conn.close()

    return menu

# Expose the get_menu() function to JavaScript
@eel.expose
def get_menu():
    return get_menu_from_db()

# Start the web app
eel.start('index.html', size=(800, 720), resizable=False)
