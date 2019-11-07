
class Word {

  int TIME = 60;
  int SPAWN_SIZE = 60;
  int NORMAL_SIZE = 24;
  int DECREASE_TIME = 10;
  
  float size;
  int counter = 0;
  int targetx, targety;
  float offsetx, offsety;
  float posx, posy;
  String word;
  boolean donex, doney;
  
  
 
  Word(String s, int x, int y) {
    //println(s + " " + x + " " + y);
    donex = false;
    doney = false;
    word = s;
    targetx = x;
    targety = y;
    posx = width/2;
    posy = height/2;
    offsetx = (targetx - posx) / TIME;
    offsety = (targety - posy) / TIME;
    size = SPAWN_SIZE;
  }
 
  void update() {
    if (!donex || !doney) {
      donex = abs(targetx - posx) < 2;
      doney = abs(targety - posy) < 2;
    }
    
    // Transition movement
    if (!donex) {
      posx += (targetx - posx)/10;
      //posx += offsetx;
    }
    if (!doney) {
      posy += (targety - posy)/10;
      //posy += offsety; 
    }
    

    // Floating movement
    if (counter % 5 == 0) {
      posx += (targetx - posx) * random(1) + random(1);
      posy += (targety - posy) * random(1) + random(1);
    }
    
    // Size change
    if ((int)size > NORMAL_SIZE ) {
      size = size - ((SPAWN_SIZE - NORMAL_SIZE)/(float)(DECREASE_TIME*60));
    }
    
    // DRAW
    fill(255);
    textAlign(CENTER);
    textSize(size);
    text(word, posx, posy);
    counter = (counter+1) % 60;

     
  }
 
}
