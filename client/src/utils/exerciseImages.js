// This file maps exercise names to their images
// Uses local assets where available, falls back to CDN for others

// Default exercise image from CDN (always available)
const DEFAULT_IMAGE = { uri: 'https://img.icons8.com/ios-filled/100/4CAF50/dumbbell.png' };

// Import local exercise images

import squat from "../../assets/images/exercises/legs/squat.webp"
import legExtension from "../../assets/images/exercises/legs/leg_extensions.webp"
import legCurl from "../../assets/images/exercises/legs/leg-curl.webp"
import calfRaise from "../../assets/images/exercises/legs/calf_raise.webp"
import gobletSquat from "../../assets/images/exercises/legs/goblet_squat.webp"

import shrugs from "../../assets/images/exercises/shoulders/shrugs.webp"
import dumbellPress from "../../assets/images/exercises/shoulders/dubell-press.webp"
import dumbbellLateralRaise from "../../assets/images/exercises/shoulders/side-lateral.jpeg"
import dumbbellFrontRaise from "../../assets/images/exercises/shoulders/front-raise.jpeg"
import reverseFly from "../../assets/images/exercises/shoulders/reverse-fly.jpeg"

import benchPress from "../../assets/images/exercises/chest/bench-press.jpeg"
import inclineDumbbellPress from "../../assets/images/exercises/chest/incline-dumbell.jpeg"
import declineDumbbellPress from "../../assets/images/exercises/chest/decline-dumbell.jpeg"
import machineFlys from "../../assets/images/exercises/chest/fly-macine.jpeg"
import dumbbellFlys from "../../assets/images/exercises/chest/Standing-Dumbbell-Fly.jpg"

import deadlift from "../../assets/images/exercises/back/deadlift.jpeg"
import latPulldown from "../../assets/images/exercises/back/lat-pulldown.jpeg"
import cableRow from "../../assets/images/exercises/back/row-cabel.jpeg"
import oneArmDumbbell from "../../assets/images/exercises/back/one-arm-dumbell.png"
import tbar from "../../assets/images/exercises/back/tbar.jpg"

import barbellCurl from "../../assets/images/exercises/arms/barbell-curl.jpeg"
import concentratedCurl from "../../assets/images/exercises/arms/concentrated.jpeg"
import dumbbellCurl from "../../assets/images/exercises/arms/dumbell-curl.jpeg"
import hammerCurl from "../../assets/images/exercises/arms/hammer.jpeg"
import overHead from "../../assets/images/exercises/arms/overhead.webp"
import pushdown from "../../assets/images/exercises/arms/pushdown-bar.jpg"
import pushdownCurl from "../../assets/images/exercises/arms/pushdown-curl.jpg"

// Map of exercise names to their images
const exerciseImages = {
    situps: squat,
    leg_extension: legExtension,
    leg_curl: legCurl,
    calf_raise: calfRaise,
    goblet_squat: gobletSquat,
    shrugs: shrugs,
    dumbbell_shoulder_press: dumbellPress,
    dumbbell_lateral_raise: dumbbellLateralRaise,
    dumbbell_front_raise: dumbbellFrontRaise,
    reverse_fly: reverseFly,
    flat_bench_press: benchPress,
    incline_dumbbell_press: inclineDumbbellPress,
    decline_barbell_press: declineDumbbellPress,
    machine_flys: machineFlys,
    dumbbell_cr_flys: dumbbellFlys,
    deadlift: deadlift,
    lat_pulldown: latPulldown,
    cable_row: cableRow,
   dumble_one_arm_row: oneArmDumbbell,
    tbar: tbar,
    barbell_curl: barbellCurl,
    concentration_curl: concentratedCurl,
    dumbbell_curl: dumbbellCurl,
    hammer_curl: hammerCurl,
    overhead_tricep_extension: overHead,
    tricep_pushdown: pushdown,
    pushdown_curl: pushdownCurl,
}
// Local images for exercises we have, CDN for others
        console.log({squat})
/**
 * Get the appropriate image for an exercise
 * @param {string} exerciseName - The name of the exercise
 * @returns {Object} Image source object (local import or URI)
 */
export const getExerciseImage = (exerciseName) => {     
  if (!exerciseName) return DEFAULT_IMAGE;
  
  const imageName = exerciseName.toLowerCase().replace(/\s+/g, '_');
  return exerciseImages[imageName] || DEFAULT_IMAGE;
};
