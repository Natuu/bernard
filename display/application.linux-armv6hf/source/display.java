import processing.core.*; 
import processing.data.*; 
import processing.event.*; 
import processing.opengl.*; 

import websockets.*; 
import java.util.concurrent.*; 

import java.util.HashMap; 
import java.util.ArrayList; 
import java.io.File; 
import java.io.BufferedReader; 
import java.io.PrintWriter; 
import java.io.InputStream; 
import java.io.OutputStream; 
import java.io.IOException; 

public class display extends PApplet {




ConcurrentHashMap<String, Word> words;
WebsocketClient cl;


int marginx = 100;
int marginy = 100;

PFont font_regular;
PFont font_light;
PFont font_bold;

int text_size;



public void setup() {
  if (args == null || args.length != 4)
  {
    System.out.println("usage: ./display <host> <text_size>");
    exit();
  }
  
  
  surface.setResizable(true);
  
  text_size = Integer.parseInt(args[3]);
  size(Integer.parseInt(args[1]), Integer.parseInt(args[2]));
  colorMode(HSB, 360, 100, 100);
    
  font_regular = createFont("Quicksand-Regular.ttf", 32);
  font_light = createFont("Quicksand-Light.ttf", 32);
  font_bold = createFont("Quicksand-Bold.ttf", 32);
  textFont(font_regular);

  frameRate(60);
  
  print("Host is "+ args[0]);  
  cl = new WebsocketClient(this, "ws://" + args[0]);
  print("Connected.");
  words = new ConcurrentHashMap<String, Word>();
  
  //flood_words();
  //ws.sendMessage("{\"type\":\"display\"}");
}

public void draw() {
  background(0); 
  fill(255);
 
  //if ((int)random(15) == 5) flood_words();

  for (Word w : words.values()) {
    w.update(); 
  }
}
String lorem = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";
String[] pool = lorem.split("[ ,.]");
public void flood_words() {
  //words.put("", new Word(pool[(int)random(pool.length)], (int)random(width), (int)random(height)));

}



public void webSocketEvent(String msg){
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

class Word {

  int TIME = 60;
  int SPAWN_SIZE = 40;
  int NORMAL_SIZE = 24;
  int DECREASE_TIME = 10;
  
  float size;
  int counter = 0;
  int targetx, targety;
  int hue, targetHue;
  float posx, posy;
  String word;
  boolean donex, doney, donehue;
  int fontNumber;
  

  
  
 
  Word(String s, int x, int y, int hue, int fontNumber, int size) {
    //println(s + " " + x + " " + y);
    NORMAL_SIZE = size;
    donex = false;
    doney = false;
    word = s;
    targetx = x;
    targety = y;
    posx = displayWidth/2;
    posy = displayHeight/2;
    size = SPAWN_SIZE;
    targetHue = hue;
    this.fontNumber = fontNumber;
  }
 
  public void setTarget(int targetx, int targety, int hue, int fontNumber) {
     this.targetx = targetx;
     this.targety = targety;
     this.targetHue = hue;
     this.donex = false;
     this.doney = false;
     this.fontNumber = fontNumber;
  }
 
  public void update() {
    if (!donex || !doney) {
      donex = abs(targetx - posx) < 2;
      doney = abs(targety - posy) < 2;
    }
    
    if (!donehue ) {
      donehue = abs(targetHue - hue) < 2;
    }
    
    
    // Transition movement
    if (!donex) {
      posx += (targetx - posx)/10;
    }
    if (!doney) {
      posy += (targety - posy)/10;
    }
    if (!donehue) {
      hue += (targetHue - hue)/10;
    }
    

    // Floating movement
    //if (counter % 2 == 0) {
    //  posx += (targetx - posx) * random(1) + random(1);
    //  posy += (targety - posy) * random(1) + random(1);
    //}
    
    // Size change
    //if ((int)size > NORMAL_SIZE ) {
    //  size = size - ((SPAWN_SIZE - NORMAL_SIZE)/(float)(DECREASE_TIME*60));
    //}
    
    // DRAW
    fill(hue, 100, 100);
    
    if (fontNumber == 0)
      textFont(font_light);
    else if (fontNumber == 1)
      textFont(font_regular);
    else if (fontNumber == 2)
      textFont(font_bold);
    textAlign(CENTER);
    textSize(NORMAL_SIZE);
    text(word, posx, posy);
    counter = (counter+1) % 60;

     
  }
 
}
  public void settings() {  fullScreen(); }
  static public void main(String[] passedArgs) {
    String[] appletArgs = new String[] { "display" };
    if (passedArgs != null) {
      PApplet.main(concat(appletArgs, passedArgs));
    } else {
      PApplet.main(appletArgs);
    }
  }
}
