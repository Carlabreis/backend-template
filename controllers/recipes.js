const cloudinary = require("../middleware/cloudinary");
const Recipe = require("../models/Recipe");

module.exports = {
  getProfile: async (req, res) => { 
    console.log(req.user)
    try {
      //Since we have a session each request (req) contains the logged-in users info: req.user
      //console.log(req.user) to see everything
      //Grabbing just the recipes of the logged-in user
      const recipes = await Recipe.find({ user: req.user.id });
      //Sending recipe data from mongodb and user data to ejs template
      res.render("profile.ejs", { recipes: recipes, user: req.user });
    } catch (err) {
      console.log(err);
    }
  },
  getRecipe: async (req, res) => {
    try {
      //id parameter comes from the recipe routes
      //router.get("/:id", ensureAuth, recipesController.getRecipe);
      //http://localhost:2121/recipe/631a7f59a3e56acfc7da286f
      //id === 631a7f59a3e56acfc7da286f
      const recipe = await Recipe.findById(req.params.id);
      res.render("recipe.ejs", { recipes: recipes, user: req.user});
    } catch (err) {
      console.log(err);
    }
  },
  createRecipe: async (req, res) => {
    try {
      // Upload image to cloudinary
      const result = await cloudinary.uploader.upload(req.file.path);

      //media is stored on cloudainary - the above request responds with url to media and the media id that you will need when deleting content 
      await Recipe.create({
        name: req.body.name,
        image: result.secure_url,
        cloudinaryId: result.public_id,
        ingredients: req.body.ingredients,
        directions: req.body.directions,
        likes: 0,
        user: req.user.id,
      });
      console.log("Recipe has been added!");
      res.redirect("/profile");
    } catch (err) {
      console.log(err);
    }
  },
  likeRecipe: async (req, res) => {
    try {
      await Recipe.findOneAndUpdate(
        { _id: req.params.id },
        {
          $inc: { likes: 1 },
        }
      );
      console.log("Likes +1");
      res.redirect(`/recipe/${req.params.id}`);
    } catch (err) {
      console.log(err);
    }
  },
  deleteRecipe: async (req, res) => {
    try {
      // Find recipe by id
      let recipe = await Recipe.findById({ _id: req.params.id });
      // Delete image from cloudinary
      await cloudinary.uploader.destroy(recipe.cloudinaryId);
      // Delete recipe from db
      await Recipe.remove({ _id: req.params.id });
      console.log("Deleted Recipe");
      res.redirect("/profile");
    } catch (err) {
      res.redirect("/profile");
    }
  },
};
