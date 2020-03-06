import websockets.*;
import java.util.concurrent.*;

ConcurrentHashMap<String, Word> words;
WebsocketClient cl;


int marginx = 100;
int marginy = 100;

PFont font_regular;
PFont font_light;
PFont font_bold;

int text_size;



void setup() {
  if (args == null || args.length != 2)
  {
    System.out.println("usage: ./display <host> <text_size>");
    exit();
  }
  
  fullScreen();
  surface.setResizable(true);
  
  text_size = Integer.parseInt(args[1]);
  colorMode(HSB, 360, 100, 100);
    
  font_regular = createFont("Quicksand-Regular.ttf", 32);
  font_light = createFont("Quicksand-Light.ttf", 32);
  font_bold = createFont("Quicksand-Bold.ttf", 32);
  textFont(font_regular);

  frameRate(60);
  
  System.out.println("Host is "+ args[0]);  
  cl = new WebsocketClient(this, "ws://" + args[0]);
  System.out.println("Connected.");
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
  //words.put("", new Word(pool[(int)random(pool.length)], (int)random(width), (int)random(height)));

}



void webSocketEvent(String msg){
  //println(msg);
  msg = msg.trim();

  JSONObject json = parseJSONObject(msg);
  boolean newWord; // le mot reçu est nouveau
  int x, y, hue, font;
  
  JSONArray wordsData = json.getJSONArray("words");
  for (int i = 0; i < wordsData.size(); i++) {
    JSONObject word = wordsData.getJSONObject(i);
    x = (int)(word.getFloat("x") * (displayWidth-(marginx*2)) + marginx);
    y = (int)(word.getFloat("y") * (displayHeight-(marginy*2)) + marginy);
    hue = (int)((float)(word.getFloat("color")) * 200);
    font = (int)((float)(word.getFloat("color")) * 3);
    
    if (word.getBoolean("new")) { 
      words.put(word.getString("value"), new Word(word.getString("value"), x, y, hue, font, text_size));
    } else {
      words.get(word.getString("value")).setTarget(x, y, hue, font);
    }  
    
  }
}
