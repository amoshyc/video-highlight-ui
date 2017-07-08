from pathlib import Path
from sys import argv
from math import ceil
from moviepy.editor import VideoFileClip
from tqdm import tqdm
import json


def main():
    video_path = Path(argv[1]).expanduser()
    video = VideoFileClip(str(video_path))
    label_path = Path(argv[2]).expanduser()
    with label_path.open('r') as f:
        data = json.loads(f.read())

    n = ceil(video.duration * video.fps)
    flag = [0 for _ in range(n)]

    for s, e in tqdm(zip(data['starts'], data['ends'])):
        fs = round(s * video.fps)
        fe = round(e * video.fps)
        for i in range(fs, fe + 1):
            flag[i] = 1

    res = {'labels': flag}
    with open('label.json', 'w') as f:
        json.dump(res, f)


if __name__ == '__main__':
    main()