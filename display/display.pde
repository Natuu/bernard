import websockets.*;
import java.util.concurrent.*;

ConcurrentHashMap<String, Word> words;
WebsocketClient cl;


int marginx = 50;
int marginy = 50;

void setup() {
  size(800, 400);
  frameRate(60);
  
  cl = new WebsocketClient(this, "ws://127.0.0.1:1338");
  words = new ConcurrentHashMap<String, Word>();
  
  //flood_words();
  //ws.sendMessage("{\"type\":\"display\"}");
}

void draw() {
  background(0); 
  fill(255);
 
  //if ((int)random(15) == 5) flood_words();

  for (Word w : words.values()) {
    w.update(); 
  }
}
String lorem = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";
String[] pool = lorem.split("[ ,.]");
void flood_words() {
  words.put("", new Word(pool[(int)random(pool.length)], (int)random(width), (int)random(height)));

}



void webSocketEvent(String msg){
  println(msg);
  msg = msg.trim();

  JSONObject json = parseJSONObject(msg);
  boolean newWord; // le mot reçu est nouveau
  int x, y;
  
  JSONArray wordsData = json.getJSONArray("words");
  for (int i = 0; i < wordsData.size(); i++) {
    JSONObject word = wordsData.getJSONObject(i);
    x = (int)(word.getFloat("x") * (width-(marginx*2)) + marginx);
    y = (int)(word.getFloat("y") * (height-(marginy*2)) + marginy);
    if (word.getBoolean("new")) { 
      words.put(word.getString("value"), new Word(word.getString("value"), x, y));
    } else {
      words.get(word.getString("value")).setTarget(x, y);
    }  
    
  }
}
