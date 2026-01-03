from flask import Flask, jsonify
import mysql.connector

app = Flask(__name__)

# Verbindung zur MySQL-Datenbank herstellen
db_connection = mysql.connector.connect(
  host="localhost",
  user="root",
  password="vWiMJxtdvXhPlLRPs8Wj",
  database="tj24"
)

# Route zum Abrufen der Daten aus der Datenbank
@app.route('/api/daten', methods=['GET'])
def get_daten():
    cursor = db_connection.cursor(dictionary=True)
    cursor.execute('SELECT * FROM tj24_data')
    results = cursor.fetchall()
    cursor.close()
    return jsonify(results)

# Main-Applikation starten
if __name__ == '__main__':
    app.run(debug=True)
