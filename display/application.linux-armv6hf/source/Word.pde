
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
  

  
  
 
  Word(String s, int x, int y, int hue, int fontNumber) {
    //println(s + " " + x + " " + y);
    donex = false;
    doney = false;
    word = s;
    targetx = x;
    targety = y;
    posx = width/2;
    posy = height/2;
    size = SPAWN_SIZE;
    targetHue = hue;
    this.fontNumber = fontNumber;
  }
 
  void setTarget(int targetx, int targety, int hue, int fontNumber) {
     this.targetx = targetx;
     this.targety = targety;
     this.targetHue = hue;
     this.donex = false;
     this.doney = false;
     this.fontNumber = fontNumber;
  }
 
  void update() {
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
    textSize(size);
    text(word, posx, posy);
    counter = (counter+1) % 60;

     
  }
 
}
