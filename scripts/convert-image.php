<?php
// The GitHub runner has ImageMagick via its preinstalled PHP extension, not the CLI.
// This is only a build-time adapter; no PHP is deployed or installed.
declare(strict_types=1);
if ($argc !== 4 || !extension_loaded('imagick')) {
    fwrite(STDERR, "Usage: php convert-image.php original width destination; Imagick required.\n");
    exit(1);
}
try {
    $image = new Imagick($argv[1]);
    if (method_exists($image, 'autoOrient')) $image->autoOrient();
    elseif (method_exists($image, 'autoOrientImage')) $image->autoOrientImage();
    elseif ($image->getImageOrientation() > 1) throw new RuntimeException('Cannot apply image orientation.');
    $width = min((int)$argv[2], $image->getImageWidth());
    if ($width < 1) throw new RuntimeException('Invalid image width.');
    $image->thumbnailImage($width, 0);
    $image->stripImage();
    $format = strtolower(pathinfo($argv[3], PATHINFO_EXTENSION));
    if (!in_array($format, ['webp', 'jpg', 'png'], true)) throw new RuntimeException('Invalid output format.');
    $image->setImageFormat($format === 'jpg' ? 'jpeg' : $format);
    $image->setImageCompressionQuality(84);
    if (!$image->writeImage($argv[3])) throw new RuntimeException('Image write failed.');
    $image->clear();
} catch (Throwable $error) {
    fwrite(STDERR, $error->getMessage() . "\n");
    exit(1);
}
