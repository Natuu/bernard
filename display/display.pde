import websockets.*;


ArrayList<Word> words;
WebsocketClient cl;

void setup() {
  size(2000, 1000);
  frameRate(60);
  
  cl = new WebsocketClient(this, "ws://192.168.43.218:1337");
  //cl = new WebsocketClient(this, "ws://127.0.0.1:1337");
  words = new ArrayList<Word>();
  
  //flood_words();
  cl.sendMessage("{\"type\":\"display\"}");
}

void draw() {
  background(0); 
  fill(255);
 
  //if ((int)random(15) == 5) flood_words();
  
  for (Word w : words) {
    w.update(); 
  }
}

String lorem = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";
String[] pool = lorem.split("[ ,.]");
void flood_words() {
  words.add(new Word(pool[(int)random(pool.length)], (int)random(width), (int)random(height)));
}



void webSocketEvent(String msg){
  println(msg);
  msg = msg.trim();
  String[] data = msg.split("_");
  words.add(new Word(data[0], Integer.valueOf(data[1]), Integer.valueOf(data[2])));
}
