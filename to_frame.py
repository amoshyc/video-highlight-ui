from pathlib import Path
from sys import argv
from moviepy.editor import VideoFileClip


def main():
    path = Path(argv[1])
    video = VideoFileClip(str(path))

    target = (path.parent / 'frames')
    target.mkdir(exist_ok=True)
    result = str(target / '%08d.jpg')
    video.write_images_sequence(result)


if __name__ == '__main__':
    main()
